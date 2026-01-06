import { ApiError, errorTypes } from "../error/api-error";
import { Payment } from "../models/payment";
import { logger } from "../utils/logger";
import { GeneralService } from "./general-service";
import { Database } from "../database";
import { GeneralQueries } from "../queries/general-queries";
import { FiftyFinPayload, LmsPreOrRePaymentPayload, ReleaseLimitPayload, TransactionApiService } from "./transaction-api-service";
import { Utils } from "../utils/utils";

export enum PostTxnClaim {
    Claimed = 'claimed',
    AlreadyDone = 'already_done',
    Wait = 'wait',
}

export class PostTransactionService {
    private static readonly paymentModeInstrumentMap: Record<string, string> = {
        UPI: "UPI",
        NB: "Other",
        CARD: "DEBIT_CARD"
    };
    private static readonly POST_TXN_CLAIM_TTL_MS = 10 * 60 * 1000; // 10 minutes

    public static async handlePostTransaction(paymentId: string): Promise<void> {
        try {
            const claim = await this.claimPostTransaction(paymentId);

            if (!this.shouldProceedFromClaim(paymentId, claim))
                return;

            await this.processPostTransaction(paymentId);
        } catch (error) {
            logger.error(`[PostTransactionService] Post transaction third party api call issue on function handlePostTransaction :: `, error);
            try { await this.releaseClaim(paymentId); } catch { /* ignore */ }
            throw error;
        }
    }

    private static shouldProceedFromClaim(paymentId: string, claim: PostTxnClaim): boolean {
        if (claim === PostTxnClaim.Claimed) return true;
        if (claim === PostTxnClaim.AlreadyDone) {
            logger.info(`[PostTransactionService] Post-transaction already completed for paymentId=${paymentId}`);
            return false;
        }
        logger.warn(`[PostTransactionService] Another worker is processing post-transaction for paymentId=${paymentId}`);
        return false;
    }

    private static async processPostTransaction(paymentId: string): Promise<void> {
        const payment = await GeneralQueries.getPaymentWithUserDetails('id', paymentId);
        if (!payment) {
            await this.releaseClaim(paymentId);
            throw new ApiError(errorTypes.paymentNotFound);
        }

        if (!payment.postTransaction)
            await this.handleLmsPostTransaction(payment);

        if (['LAS', 'LAMF'].includes(payment.user.product.product))
            await this.handleReleaseLimitAndFiftyFin(payment);

        await this.finalizePostTransaction(paymentId);
    }

    private static async claimPostTransaction(paymentId: string): Promise<PostTxnClaim> {
        return await Database.manager.transaction(async (manager) => {
            const payment = await manager.createQueryBuilder(Payment, 'payment').setLock('pessimistic_write')
                .leftJoinAndSelect('payment.user', 'user').leftJoinAndSelect('user.product', 'product')
                .where('payment.id = :id', { id: paymentId }).getOne();

            if (!payment)
                throw new ApiError(errorTypes.paymentNotFound);

            if (payment.postTransaction && this.isAncillaryDone(payment))
                return PostTxnClaim.AlreadyDone;

            if (this.isPostTransactionAlive(payment))
                return PostTxnClaim.Wait;

            await manager.update(Payment, paymentId, { postTransactionInProgress: true, postTransactionClaimedAt: new Date() });
            return PostTxnClaim.Claimed;
        });
    }

    private static isAncillaryDone(payment: Payment): boolean {
        const productCode = payment.user?.product?.product ?? '';
        const ancillaryRequired = ['LAS', 'LAMF'].includes(productCode);
        const ancillaryDone = !ancillaryRequired || (!!payment.releaseLimit && !!payment.fiftyFin);
        return ancillaryDone;
    }

    private static isPostTransactionAlive(payment: Payment): boolean {
        const claimedAtMs = payment.postTransactionClaimedAt ? new Date(payment.postTransactionClaimedAt).getTime() : 0;
        const alive = !!payment.postTransactionInProgress && !!claimedAtMs && (Date.now() - claimedAtMs) < this.POST_TXN_CLAIM_TTL_MS;
        return alive;
    }

    private static async finalizePostTransaction(paymentId: string): Promise<void> {
        await Database.manager.update(Payment, paymentId, {
            postTransaction: true,
            postTransactionInProgress: false,
            postTransactionClaimedAt: null,
        });
    }

    private static async releaseClaim(paymentId: string): Promise<void> {
        await Database.manager.update(Payment, paymentId, {
            postTransactionInProgress: false,
            postTransactionClaimedAt: null,
        });
    }

    public static async handleLmsPostTransaction(payment: Payment): Promise<void> {
        //  Get the date of LMS
        const dateOfLMSData = await TransactionApiService.getDateOfLMS();

        // Create a transaction in LMS: Default as RePayment
        const lmsPayload: LmsPreOrRePaymentPayload = {
            transaction: {
                transactionName: "Repayment",
                accountId: payment.user.accountId,
                valueDateStr: dateOfLMSData, amount1: payment.amount,
                description: "Flow Collection", userId: payment.user.id,
                instrument: this.getInstrument(payment.paymentMode),
                reference: "accountCode:5580360", transactionLotId: payment.txnID // Pass the transaction ID from the PG API
            }, safeMode: "true", runReversedTransactions: "true"
        };

        // if user wants to lower loan EMI then it would be considered as PrePayment & installment amount need to be adjust
        if (payment.lowerEMI) {
            lmsPayload.transaction.transactionName = "Prepayment";
            lmsPayload.transaction.description = "Repayment";
            lmsPayload.transaction.param1 = "ADJUST_INSTALLMENT";
        }

        // Double check that postTransaction is already true if not then send LMS post transaction request
        if (!payment.postTransaction) {
            await TransactionApiService.sendLmsPostTransaction(lmsPayload);
            await this.updatePayment(payment, { postTransaction: true });
        }
    }

    public static async handleReleaseLimitAndFiftyFin(payment: Payment): Promise<[releaseLimit: boolean, fiftyFin: boolean]> {
        let releaseLimit: boolean = false;
        let fiftyFin: boolean = false;
        const { mobile, customerId, accountId, product: loanProduct } = payment.user;
        const { product } = loanProduct;

        const [releaseAmount, applicationId] = await this.getReleaseAmount(mobile, customerId, accountId, product);
        // -------- Release Limit API Call
        if (!payment.releaseLimit) {
            await this.handleReleaseLimitPostTransaction(payment, customerId, product, releaseAmount);
            releaseLimit = true;
        }
        // -------- FiftyFin API Call
        if (!payment.fiftyFin) {
            await this.handleFiftyFinPostTransaction(payment, applicationId);
            fiftyFin = true;
        }

        return [releaseLimit, fiftyFin];
    }

    public static async handleReleaseLimitPostTransaction(payment: Payment, customerId: string, product: string, releaseAmount: number): Promise<void> {
        // -------- Release Limit API Call
        const releaseLimitPayload: ReleaseLimitPayload = {
            limitId: customerId,
            product: (product == 'LAS' || product == 'LAMF') ? 'LAS' : product,
            releaseAmount
        };

        await TransactionApiService.sendReleaseLimitPostTransaction(releaseLimitPayload);

        await this.updatePayment(payment, { releaseLimit: true });
    }

    public static async handleFiftyFinPostTransaction(payment: Payment, applicationId: string) {
        const { id: userId, mobile, customerId, accountId, product: loanProduct } = payment.user;
        const getLimitOfCustomerAPI = await GeneralService.getLimitOfCustomerAPI({ phone: mobile, customerId: customerId, product: loanProduct.product });
        const fiftyFinPayload: FiftyFinPayload = {
            userId,
            applicationId,
            accountNumber: accountId,
            disbursementAmount: Number(getLimitOfCustomerAPI.data.utilisedLimit)
        };
        await TransactionApiService.sendFiftyFinPostTransaction(fiftyFinPayload);
        await this.updatePayment(payment, { fiftyFin: true });
    }

    public static async getReleaseAmount(mobile: string, customerId: string, accountId: string, product: string): Promise<[number, string]> {
        // Get Loan Account Info
        const { principalNotDue, totalPrincipalDue, udfText1: applictionId } = await GeneralService.getLoanAccountInfo(accountId);

        const total_principal_outstanding = Number(principalNotDue ?? 0) + Number(totalPrincipalDue ?? 0);

        logger.info(`Total Principal Due: ${totalPrincipalDue}`);
        logger.info(`Total Principal Not Due: ${principalNotDue}`);
        logger.info(`Total Principal Outstanding: ${total_principal_outstanding}`);

        //  Get Limit of Customer API
        const getLimitOfCustomerAPI = await GeneralService.getLimitOfCustomerAPI({ phone: mobile, customerId, product });

        const releaseAmount = parseFloat(getLimitOfCustomerAPI.data.utilisedLimit ?? 0) - total_principal_outstanding;

        logger.info(`Utilized Amount: ${getLimitOfCustomerAPI.data.utilisedLimit}`);
        logger.info(`Release Amount: ${releaseAmount}`);
        return [releaseAmount, applictionId];
    }

    public static getInstrument(paymentMode?: string | null): string | undefined {
        const instrument = typeof paymentMode === 'string'
            ? (this.paymentModeInstrumentMap[paymentMode.toUpperCase()] ?? paymentMode)
            : paymentMode ?? undefined;
        return instrument ?? undefined;
    }

    public static async updatePayment(payment: Payment, updateData: Partial<Payment>): Promise<Payment> {
        const [somethingChanged, changes] = Utils.updateMappedFields(payment, updateData);
        if (somethingChanged)
            await Database.manager.update(Payment, payment.id, changes);
        return payment;
    }
}

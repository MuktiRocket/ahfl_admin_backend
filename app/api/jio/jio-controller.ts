import { Request, Response } from 'express';
import { Controller } from "../controller";
import { RequestMethod } from "../request-method";
import { ThirdPartyApiService } from '../../services/thirdparty-api-service';
import { Jwt } from '../../utils/jwt';
import { AuthUser, UserJwtPayLoad } from '../../middlewares/auth-handler';
import { User } from '../../models/user';
import { Database } from '../../database';
import { Env } from '../../utils/env';
import { UserQueries } from '../../queries/user-queries';
import { ApiError, errorTypes } from '../../error/api-error';
import { logger } from '../../utils/logger';

interface GenerateTokenResponse {
    access_token: string;
    scope: string;
    api_domain: string;
    token_type: string;
    expires_in: number;
}

interface ContactSearchParams {
    access_token?: string;
    phone: string;
    limit: number;
}

interface CreateTicketContactParams {
    access_token?: string;
    contactId: string;
    subject: string;
    departmentId: string;
    channel: string;
    description: string;
    status: string;
    phone: string;
    cf: {
        cf_delivery_status: string;
        cf_tagcode: number;
        cf_tag_code: number;
        cf_loan_account_number: string;
        cf_customer_id: string;
        cf_customer_query: string;
    }
}

interface ContactSearchByPhoneParams {
    access_token?: string;
    phone: string;
}

interface GetTicketByIdParams {
    access_token?: string;
    id: string;
}

interface GetThreadsParams {
    access_token?: string;
    from: string;
    limit: string;
    id?: string;
}

interface ContactDetails {
    lastName: string;
    phone: string;
    email: string;
}

interface CreateTicketRequest {
    access_token?: string;
    contact: ContactDetails;
    subject: string;
    departmentId: string;
    channel: string;
    description: string;
    phone: string;
    cf: {
        cf_is_customer: string;
    };
}

interface CreateCommentRequest {
    access_token?: string;
    isPublic: string;
    contentType: string;
    content: string;
    ticketId?: string;
}

interface GetLimitRequest {
    phone?: string;
    customerId: string;
    product: string;
}


export class JioController extends Controller {
    protected name: string = "jio";

    protected createRoutes(): void {

        // This endpoint is for internal use only and hiddend from the api docs
        this.publicRoute(RequestMethod.POST, '/access-token', this.getAccess.bind(this), { validate: false });

        // This endpoint will be shared with the Jio team
        this.authenticatedUserRoute(RequestMethod.GET, '/app-url', this.getAppUrl.bind(this));

        this.publicRoute(RequestMethod.POST, '/validate-key', this.validateKey.bind(this));
        this.publicRoute(RequestMethod.POST, '/dashboard', this.redirect.bind(this), { validate: false });

        this.guestUserRoute(RequestMethod.POST, '/generate', this.generateToken.bind(this));
        this.guestUserRoute(RequestMethod.GET, '/contacts/search', this.contactSearch.bind(this));
        this.guestUserRoute(RequestMethod.POST, '/create/ticket/contact', this.createTicketContact.bind(this));
        this.guestUserRoute(RequestMethod.POST, '/contacts/create-contact', this.createContact.bind(this));
        this.guestUserRoute(RequestMethod.GET, '/contacts/search-ticket-by-phone', this.searchTicketByPhoneNumber.bind(this));
        this.guestUserRoute(RequestMethod.GET, '/contacts/get-ticket-by-id', this.getTicketById.bind(this));
        this.guestUserRoute(RequestMethod.GET, '/contacts/get-threads', this.getThreads.bind(this));
        this.guestUserRoute(RequestMethod.POST, '/contacts/create-comments', this.createComments.bind(this));
        this.guestUserRoute(RequestMethod.POST, '/loan/getLimit', this.getLoanLimit.bind(this));
        this.guestUserRoute(RequestMethod.GET, '/lead/leadInfo', this.getLeadInfo.bind(this));
    }

    private async redirect(req: Request, res: Response): Promise<void> {
        const { jwtToken }: { jwtToken: string } = req.body;
        try {
            const auth = await this.validateToken(jwtToken);
            const user = await Database.manager.save(new User(auth.mobile));
            const url = `${Env.FRONTEND_URL}?key=${user.id}`
            // res.json({ url });
            res.redirect(url);
        } catch (error) {
            logger.error("Error in redirect:", error);
            res.redirect(`${Env.FRONTEND_URL}/unauthorized`);
        }

    }

    private validateToken(token: string): Promise<AuthUser> {
        return new Promise((resolve, reject) => {
            if (!token)
                reject(new ApiError(errorTypes.noAuthToken));

            Jwt.verify<UserJwtPayLoad>(token).then((decodedData) => {
                if (!decodedData)
                    return reject(new ApiError(errorTypes.invalidToken));
                const auth: AuthUser = {
                    isGuest: false,
                    mobile: decodedData.data
                };
                resolve(auth);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private async getAccess(req: Request, res: Response): Promise<void> {
        const { mobile }: { mobile: string } = req.body;
        const token = Jwt.sign({ data: mobile }, '30d');
        res.json({ token });
    }

    private async getAppUrl(_: Request, res: Response): Promise<void> {
        const auth: AuthUser = res.locals.auth;
        const user = await Database.manager.save(new User(auth.mobile));
        res.json({ url: `${Env.FRONTEND_URL}?key=${user.id}` });
    }

    private async validateKey(req: Request, res: Response): Promise<void> {
        const { key }: { key: string } = req.body;
        const user = await UserQueries.findUserByIdOrFail(key, Database.manager);
        res.json({ mobile: user.mobile, apiKey: Env.GUEST_TOKEN });
    }

    private async generateToken(req: Request, res: Response): Promise<void> {
        const request = req.body;
        const url = `https://accounts.zoho.in/oauth/v2/token?${this.getParams(request)}`;
        const data = await ThirdPartyApiService.sendRequest<GenerateTokenResponse>({ method: "post", url, headers: {} });
        res.json(data);
    }

    private async contactSearch(req: Request, res: Response): Promise<void> {
        const request: ContactSearchParams = req.query as any;

        const access_token = request.access_token;
        delete request["access_token"];
        const url = `https://desk.zoho.in/api/v1/contacts/search?${this.getParams(request)}`;
        const headers = {
            Authorization: `Zoho-oauthtoken ${access_token}`,
        }
        const data = await ThirdPartyApiService.sendRequest({ method: "get", url, headers });
        res.json(data);
    }

    private async createTicketContact(req: Request, res: Response): Promise<void> {
        const request: CreateTicketContactParams = req.body;
        const access_token = request.access_token;
        delete request["access_token"];

        const url = `https://desk.zoho.in/api/v1/tickets`;
        const headers = {
            Authorization: `Zoho-oauthtoken ${access_token}`,
        }
        const data = await ThirdPartyApiService.sendRequest({ method: "post", url, headers, data: request });
        res.json(data);
    }

    private getParams(request: Record<string, any>): string {
        let params: string[] = [];
        Object.keys(request).forEach((key) => {
            params.push(`${key}=${request[key]}`);
        });
        return params.join("&");
    }

    private async createContact(req: Request, res: Response) {
        const request: CreateTicketRequest = req.body;

        const access_token = request.access_token;
        delete request["access_token"];
        const url = `https://desk.zoho.in/api/v1/tickets`;
        const headers = {
            Authorization: `Zoho-oauthtoken ${access_token}`,
        }
        const data = await ThirdPartyApiService.sendRequest({ method: "post", url, headers, data: request });
        res.json(data);
    }

    private async searchTicketByPhoneNumber(req: Request, res: Response) {
        const request: ContactSearchByPhoneParams = req.query as any;

        const access_token = request.access_token;
        delete request["access_token"];
        const url = `https://desk.zoho.in/api/v1/tickets/search?${this.getParams(request)}`;
        const headers = {
            Authorization: `Zoho-oauthtoken ${access_token}`,
        }
        const data = await ThirdPartyApiService.sendRequest({ method: "get", url, headers });
        res.json(data);
    }

    private async getTicketById(req: Request, res: Response) {
        const request: GetTicketByIdParams = req.query as any;

        const access_token = request.access_token;
        delete request["access_token"];
        const url = `https://desk.zoho.in/api/v1/tickets/${request.id}`;
        const headers = {
            Authorization: `Zoho-oauthtoken ${access_token}`,
        }
        const data = await ThirdPartyApiService.sendRequest({ method: "get", url, headers });
        res.json(data);
    }

    private async getThreads(req: Request, res: Response) {
        const request: GetThreadsParams = req.query as any;
        const id = request.id;
        const access_token = request.access_token;
        delete request["access_token"];
        delete request["id"];
        const url = `https://desk.zoho.in/api/v1/tickets/${id}/conversations?${this.getParams(request)}`;
        const headers = {
            Authorization: `Zoho-oauthtoken ${access_token}`,
        }
        const data = await ThirdPartyApiService.sendRequest({ method: "get", url, headers });
        res.json(data);
    }

    private async createComments(req: Request, res: Response) {
        const request: CreateCommentRequest = req.body;
        const id = request.ticketId;
        const access_token = request.access_token;
        delete request["access_token"];
        delete request["ticketId"];
        const url = `https://desk.zoho.in/api/v1/tickets/${id}/comments`;

        const headers = {
            Authorization: `Zoho-oauthtoken ${access_token}`,
        }
        const data = await ThirdPartyApiService.sendRequest({ method: "post", url, headers, data: request });
        res.json(data);
    }

    private async getLoanLimit(req: Request, res: Response) {
        const request: GetLimitRequest = req.body;
        const url = `https://marketplace-dev-jiofinance.ezeefin.net.in/ezeeAPI/las/v1/get-limit-of-a-customer/${request.phone}`;

        delete request["phone"];
        const headers = {
            client_id: '37e5a3ca-6192-11ed-9b6a-0242ac120002',
            entityid: 'jfs',
        }

        const data = await ThirdPartyApiService.sendRequest({ method: "post", url, headers, data: request });
        res.json(data);
    }

    private async getLeadInfo(req: Request, res: Response) {
        const url = "https://marketplace-dev-jiofinance.ezeefin.net.in/ezeeAPI/las/v1/get-basic-info-lead/LAS2025040424350";

        const headers = {
            client_id: '37e5a3ca-6192-11ed-9b6a-0242ac120002',
            entityid: 'jfs',
        }

        const data = await ThirdPartyApiService.sendRequest({ method: "get", url, headers });
        res.json(data);
    }
}
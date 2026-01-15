import { AdminUser } from "./adminUser";
import { CrmRequestData } from "./CrmRequestData";
import { Customer } from "./customer";
import { Token } from "./token";

import { ApplyLoanData } from "./apply-loan";
import { AuditTrail } from "./audit-trail";
import { Feedback } from "./feedback";
import { Lead } from "./lead";
import { TransactionData } from "./TransactionData";

export const MODELS = [
    AdminUser,
    Token,
    CrmRequestData,
    TransactionData,
    Customer,
    Lead,
    Feedback,
    AuditTrail,
    ApplyLoanData
];

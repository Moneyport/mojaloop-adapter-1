import { Money } from './mojaloop'

export type LegacyAuthorizationRequest = {
  lpsId: string;
  lpsKey: string;
  lpsAuthorizationRequestMessageId: string;
  payer: {
    partyIdType: 'MSISDN';
    partyIdentifier: string;
  };
  payee: {
    partyIdType: 'DEVICE';
    partyIdentifier: string;
    partySubIdOrType: string;
  };
  amount: Money;
  expiration: string;
  lpsFee?: Money;
  transactionType: {
    scenario: 'WITHDRAWAL' | 'REFUND';
    initiatorType: 'AGENT' | 'DEVICE';
  };
}

export type LegacyAuthorizationResponse = {
  lpsAuthorizationRequestMessageId: string;
  transferAmount: Money;
  fees: Money;
}

export type LegacyFinancialRequest = {
  lpsId: string;
  lpsKey: string;
  lpsFinancialRequestMessageId: string;
  authenticationInfo?: {
    authenticationType: string;
    authenticationValue: string;
  };
  responseType: 'ENTERED' | 'REJECTED';
}

export type LegacyFinancialResponse = {
  lpsFinancialRequestMessageId: string;
}

export type LegacyReversalRequest = {
  lpsId: string;
  lpsKey: string;
  lpsFinancialRequestMessageId: string;
  lpsReversalRequestMessageId: string;
}

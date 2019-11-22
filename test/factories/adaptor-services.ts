import { Factory } from 'rosie'
import { AdaptorServices } from '../../src/adaptor'

export const AdaptorServicesFactory = Factory.define<AdaptorServices>('AdaptorServicesFactory').attrs({
  accountLookupService: {
    requestFspIdFromMsisdn: jest.fn().mockResolvedValue(undefined)
  },
  isoMessagesService: {
    create: jest.fn()
  },
  transactionsService: {
    get: jest.fn(),
    create: jest.fn(),
    updatePayerFspId: jest.fn(),
    updateTransactionId: jest.fn(),
    sendToMojaHub: jest.fn().mockResolvedValue(undefined)
  },
  quotesService: {
    sendQuoteResponse: jest.fn().mockResolvedValue(undefined)
  }
})

import Knex from 'knex'
import { ISO0100Factory } from '../factories/iso-messages'
import { createApp } from '../../src/adaptor'
import { Server } from 'hapi'
import { AdaptorServicesFactory } from '../factories/adaptor-services'
import { KnexTransactionsService } from '../../src/services/transactions-service'
import Axios from 'axios'
import { KnexIsoMessageService } from '../../src/services/iso-message-service'

jest.mock('uuid/v4', () => () => '123')

const LPS_KEY = 'postillion:0100'
const LPS_ID = 'postillion'

describe('Transaction Requests API', function () {

  let knex: Knex
  let adaptor: Server
  const services = AdaptorServicesFactory.build()

  beforeAll(async () => {
    knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
        supportBigNumbers: true
      },
      useNullAsDefault: true
    })
    const httpClient = Axios.create()
    services.transactionsService = new KnexTransactionsService(knex, httpClient)
    services.transactionsService.sendToMojaHub = jest.fn().mockResolvedValue(undefined)
    services.isoMessagesService = new KnexIsoMessageService(knex)
    adaptor = await createApp(services)
  })

  beforeEach(async () => {
    await knex.migrate.latest()
  })

  afterEach(async () => {
    await knex.migrate.rollback()
  })

  afterAll(async () => {
    await knex.destroy()
  })

  test('stores the ISO0100 message', async () => {
    const iso0100 = ISO0100Factory.build()

    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: LPS_KEY, lpsId: LPS_ID, ...iso0100 }
    })

    expect(response.statusCode).toBe(200)
    const storedIso0100 = await knex('isoMessages').first()
    expect(storedIso0100.lpsId).toBe(LPS_ID)
    expect(storedIso0100.lpsKey).toBe(LPS_KEY)
    expect(JSON.parse(storedIso0100.content)).toMatchObject(iso0100)
  })

  test('creates a transaction request from the ISO0100 message', async () => {
    const iso0100 = ISO0100Factory.build()

    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: LPS_KEY, lpsId: LPS_ID, ...iso0100 }
    })

    expect(response.statusCode).toEqual(200)
    const transactionRequest = await services.transactionsService.get('123', 'transactionRequestId')
    expect(transactionRequest).toMatchObject({
      transactionRequestId: '123',
      payer: {
        partyIdType: 'MSISDN',
        partyIdentifier: iso0100[102]
      },
      payee: {
        partyIdInfo: {
          partyIdType: 'DEVICE',
          partyIdentifier: iso0100[41],
          partySubIdOrType: iso0100[42]
        }
      },
      amount: {
        amount: iso0100[4],
        currency: iso0100[49]
      },
      transactionType: {
        initiator: 'PAYEE',
        initiatorType: 'DEVICE',
        scenario: 'WITHDRAWAL'
      },
      authenticationType: 'OTP',
      expiration: iso0100[7]
    })
  })

  test('Requests an account lookup and uses the transactionRequestId as the traceId', async () => {
    const iso0100 = ISO0100Factory.build()

    const response = await adaptor.inject({
      method: 'POST',
      url: '/iso8583/transactionRequests',
      payload: { lpsKey: LPS_KEY, lpsId: LPS_ID, ...iso0100 }
    })

    expect(response.statusCode).toEqual(200)
    expect(services.accountLookupService.requestFspIdFromMsisdn).toHaveBeenCalledWith('123', iso0100[102])
  })

})

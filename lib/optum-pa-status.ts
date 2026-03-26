import type { PAStatusResponse, PAStatusGraphQLResponse } from '@/types/optum.types'

const PA_STATUS_QUERY = `
query PAStatus($authorizationNumber: String!, $tradingPartnerServiceId: String!) {
  priorAuthorizationStatus(
    authorizationNumber: $authorizationNumber
    tradingPartnerServiceId: $tradingPartnerServiceId
  ) {
    authorizationNumber
    tradingPartnerServiceId
    status {
      statusCode
      statusDescription
      statusCategory
      effectiveDate
      expirationDate
    }
    requestedProcedure {
      procedureCode
      procedureDescription
      serviceTypeCode
      quantity
      unitType
    }
    requestedProvider {
      npi
      organizationName
      firstName
      lastName
    }
    requestingProvider {
      npi
      organizationName
    }
    member {
      memberId
      firstName
      lastName
      dateOfBirth
      groupNumber
    }
    payer {
      name
      payerId
    }
    submittedDate
    scheduledProcedureDate
    urgencyType
    denialInfo {
      isDenied
      denialReason
      denialCode
      appealDeadline
      peerToPeerAvailable
    }
    additionalInfoRequired {
      isRequired
      infoType
      description
      dueDate
    }
    cmsComplianceStatus {
      standardResponseWindowDays
      submittedDate
      responseDeadline
      isResponseOverdue
      daysOverdue
    }
  }
}
`

export async function fetchPAStatus(
  authorizationNumber: string,
  tradingPartnerServiceId: string,
  token: string
): Promise<PAStatusResponse> {
  const graphqlUrl = process.env.OPTUM_GRAPHQL_URL
  if (!graphqlUrl) {
    throw new Error('OPTUM_GRAPHQL_URL is not configured')
  }

  const providerTaxId = process.env.OPTUM_PROVIDER_TAX_ID

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(providerTaxId ? { providerTaxId } : {}),
      'x-optum-consumer-correlation-id': `prior-auth-radar-${Date.now()}`,
      environment: 'sandbox',
    },
    body: JSON.stringify({
      query: PA_STATUS_QUERY,
      variables: { authorizationNumber, tradingPartnerServiceId },
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Optum PA Status API HTTP error: ${response.status} ${response.statusText}`
    )
  }

  const json = (await response.json()) as PAStatusGraphQLResponse

  if (json.errors && json.errors.length > 0) {
    const errorCode = json.errors[0].extensions?.code ?? 'UNKNOWN'
    const errorMessage = json.errors[0].message
    throw new Error(
      `Optum GraphQL error [${errorCode}]: ${errorMessage}`
    )
  }

  if (!json.data?.priorAuthorizationStatus) {
    throw new Error(
      'Optum PA Status API returned null data for this authorization number'
    )
  }

  return json.data.priorAuthorizationStatus
}

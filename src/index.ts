import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import isEmpty from "lodash/isEmpty";

enum IndustrySectorEnum {
  Tech = "Tech",
  Finance = "Finance",
  Bonds = "Bonds",
  'Real Estate' = "Real Estate",
  Energy = "Energy",
  Unknown = "Unknown"
}

type IndustrySector = keyof typeof IndustrySectorEnum;

interface Stock {
  id: string
  tiker: string
  buyPrice: number
  numShares: number
  sector: IndustrySector
}

interface CreateTickerRequestBody {
  userId: string
  stock: Stock
}

interface DeleteTickerRequestBody {
  userId: string
  stockId: string
}

interface GetStocksDataRequestBody {
  userId: string
}

// interface DefaultResponseBody {
//   message: string
// }

// interface StocksDataResponseBody {
//   stocks: Stock[]
// }

// type ResponseBody = StocksDataResponseBody | DefaultResponseBody;

type RequestBody = CreateTickerRequestBody | DeleteTickerRequestBody | GetStocksDataRequestBody;

const defaultHeaders = {
  "Access-Control-Allow-Origin": "*", // Required for CORS support to work
};

const defaultError: string = JSON.stringify({ message: "Unknown Error Occurred" });

const defaultSuccessResponse: string = JSON.stringify({ message: "SUCCESS" });

const invalidArgumentsError: string = JSON.stringify({ message: "Invalid Arguments Provided" });

async function mainLambdaHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log("Recieved event: ", event);

  if (isEmpty(event) || isEmpty(event.body)) {
    console.error("Event and event body should not be null or empty.");

    return constructErrorResponse(invalidArgumentsError);
  }

  const request: RequestBody = JSON.parse(event.body!);
  console.log("Retrieved request from API gateway event: ", request);

  // TODO: use request data

  console.log("Successfully executed lambda!");
  return {
    headers: defaultHeaders,
    statusCode: 200,
    body: defaultSuccessResponse
  }
}

function constructErrorResponse(error: string = defaultError): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: defaultHeaders,
    body: error
  }
}

export { mainLambdaHandler };

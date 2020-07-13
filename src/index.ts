import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import isEmpty from "lodash/isEmpty";
import StocksPortfolioItem from "./aws/dynamo/stocks-portfolio-model";
import { dynamoClient } from "./aws/dynamo/client-provider";

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
  tradeId: string
  tiker: string
  price: number
  count: number
  sector: IndustrySector
}

interface CreateTickerRequestBody {
  userId: string
  stock: Stock
}

interface DeleteTickerRequestBody {
  userId: string
  tradeId: string
}

interface GetStocksDataRequestBody {
  userId: string
}

type RequestBody = CreateTickerRequestBody | DeleteTickerRequestBody | GetStocksDataRequestBody;

const defaultHeaders = {
  "Access-Control-Allow-Origin": "*", // Required for CORS support to work
};

const defaultError: string = JSON.stringify({ message: "Unknown Error Occurred" });

const defaultSuccessResponse: string = JSON.stringify({ message: "SUCCESS" });

const invalidArgumentsError: string = JSON.stringify({ message: "Invalid Arguments Provided" });

async function mainLambdaHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log("Recieved event: ", event);

  if (isEmpty(event) || isEmpty(event.body) || isEmpty(event.path)) {
    console.error("Event, event body, event path should not be null or empty.");

    return constructErrorResponse(invalidArgumentsError);
  }

  try {
    const path: string = event.path;
    const request: RequestBody = JSON.parse(event.body!);
    console.log("Retrieved request from API gateway event: ", request);
  
    if (path === "/stock/create") {
      await createStockItem(request as CreateTickerRequestBody);
    } else if (path === "/stock/delete") {
      await deleteStockItem(request as DeleteTickerRequestBody);
    } 
    else {
      console.error("Invalid path value provided: ", path);

      return constructErrorResponse(invalidArgumentsError);
    }
  
    console.log("Successfully executed lambda!");
    return {
      headers: defaultHeaders,
      statusCode: 200,
      body: defaultSuccessResponse
    }
  } catch (e) {
    console.error("Unknown Exception Occurred: ", e);

    return constructErrorResponse();
  }
}

function constructErrorResponse(error: string = defaultError): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: defaultHeaders,
    body: error
  }
}

async function createStockItem(request: CreateTickerRequestBody) {
  if (
    isEmpty(request) ||
    isEmpty(request.userId) ||
    isEmpty(request.stock.tradeId) ||
    isEmpty(request.stock.tiker) ||
    isEmpty(request.stock.sector) ||
    request.stock.count <= 0 ||
    request.stock.price <= 0
  ) {
    console.error("Invalid request object given in CreateTickerRequestBody", request);
    throw new Error("CreateTickerRequestBody is invalid");
  }

  const item: StocksPortfolioItem = new StocksPortfolioItem()
  item.userId = request.userId;
  item.tradeId = request.stock.tradeId;
  item.ticker = request.stock.tiker;
  item.price = request.stock.price;
  item.count = request.stock.count;
  item.createdAt = getTimeNow();
  item.sector = request.stock.sector;

  const result = await dynamoClient.put(item);
  console.log("Result from db put operation is ", result);

  return result;
}

async function deleteStockItem(request: DeleteTickerRequestBody) {
  if ( 
    isEmpty(request) ||
    isEmpty(request.userId) ||
    isEmpty(request.tradeId) 
  ) {
    console.error("Invalid request object given in DeleteTickerRequestBody", request);
    throw new Error("Request is invalid");
  }

  const item = new StocksPortfolioItem()
  item.userId = request.userId;
  item.tradeId = request.tradeId;

  const result = await dynamoClient.delete(item);
  console.log("Result from db delete operation is ", result);

  return result;
}

function getTimeNow(): string {
  return new Date().toISOString();
}

export { mainLambdaHandler };

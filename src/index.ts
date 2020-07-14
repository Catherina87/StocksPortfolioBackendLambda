import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import isEmpty from "lodash/isEmpty";
import StocksPortfolioItem from "./aws/dynamo/stocks-portfolio-model";
import { dynamoClient } from "./aws/dynamo/client-provider";
// import { QueryOptions } from "@aws/dynamodb-data-mapper/build/namedParameters/QueryOptions";

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
  ticker: string
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

// const DefaultLimit = 100;

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
    } else if (path === "/stock/list") {
      const items: Stock[] = await getStocksList(request as GetStocksDataRequestBody);
      console.log("Retrieved stocks: ", items);

      return {
        headers: defaultHeaders,
        statusCode: 200,
        body: JSON.stringify({ items: items })
      }
    } else {
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
    isEmpty(request.stock.ticker) ||
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
  item.ticker = request.stock.ticker;
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

async function getStocksList(request: GetStocksDataRequestBody): Promise<Stock[]> {
  if (isEmpty(request) || isEmpty(request.userId)) {
    console.log("Invalid request object given in GetStocksDataRequestBody", request);
    throw new Error("Request is invalid");
  }

  const userId = request.userId;

  // const queryOptions: QueryOptions = {
  //   limit: DefaultLimit
  // };

  // const conditionExpression = {
  //   userId: userId
  // }

  // const paginator = dynamoClient.query(StocksPortfolioItem, conditionExpression, queryOptions).pages();

  const paginator = dynamoClient.query(
    StocksPortfolioItem,
    { userId: userId },
    { limit: 100 }
  ).pages();

  const items = [];

  for await (const page of paginator) {
    for (const row of page) {
      items.push(row);
    }
  }

  // return items.map(item => {
  //   return {
  //     tradeId: item.tradeId!,
  //     ticker: item.ticker!,
  //     price: item.price!,
  //     count: item.count!,
  //     sector: item.sector! as IndustrySector
  //   }
  // })

  // The above code can be written shorter in one line below:
  return items.map(item => Object.assign({} as Stock, item));
}

function getTimeNow(): string {
  return new Date().toISOString();
}

export { mainLambdaHandler };

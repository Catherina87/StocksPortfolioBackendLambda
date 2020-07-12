import { DataMapper } from "@aws/dynamodb-data-mapper";
import DynamoDB from "aws-sdk/clients/dynamodb";

/**
 * This DynamoDB Wrapper Client allows to talk to DynamoDB, like axios
 */
export const dynamoClient: DataMapper = new DataMapper({ client: new DynamoDB() });

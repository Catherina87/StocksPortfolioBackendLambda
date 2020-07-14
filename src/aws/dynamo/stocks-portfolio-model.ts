import { attribute, hashKey, rangeKey, table } from "@aws/dynamodb-data-mapper-annotations";

@table("StocksPortfolioDataTable")
export default class StocksPortfolioItem {

  @hashKey()
  userId?: string;

  @rangeKey()
  tradeId?: string;

  @attribute()
  ticker?: string;

  @attribute()
  price?: number;

  @attribute()
  count?: number;

  @attribute()
  sector?: string;

  @attribute()
  createdAt?: string;
}

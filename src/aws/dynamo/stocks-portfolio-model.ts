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

  // public constructor(
  //   userId?: string,
  //   tradeId?: string,
  //   ticker?: string,
  //   price?: number,
  //   count?: number,
  //   sector?: string,
  //   createdAt?: string
  // ) {
  //   this.userId = userId!;
  //   this.tradeId = tradeId!;
  //   this.ticker = ticker!;
  //   this.price = price!;
  //   this.count = count!;
  //   this.sector = sector!;
  //   this.createdAt = createdAt!;
  // }
}

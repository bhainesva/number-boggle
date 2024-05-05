import {
  DynamoDBClient,
  ExecuteStatementCommand,
} from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  const date = JSON.parse(event.body).date;
  const client = new DynamoDBClient({
    region: "us-east-2",
  });

  const input = {
    TableName: "number-boggle",
    Statement: 'SELECT * FROM "number-boggle" WHERE "Date" = ?',
    Parameters: [{ S: date }],
  };

  const command = new ExecuteStatementCommand(input);
  const res = await client.send(command);
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
};

const x = await handler({
  body: JSON.stringify({
    date: "2024-05-04",
  }),
});

import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";

function validateAndNormalizeRequest(body) {
  const { date, digits, solutions, time, score } = body;
  const [year, month, day] = date.split("-");

  if (!date) throw new Error("Missing date");
  if (!year || !month || !day) throw new Error("Invalid date");

  if (
    !digits ||
    !Array.isArray(digits) ||
    digits.length !== 4 ||
    digits.any(isNaN) ||
    digits.any((digit) => digit < 1 || digit > 9)
  )
    throw new Error("Invalid digits");

  if (isNaN(score) || score > 20 || score < 0) throw new Error("Invalid score");

  if (isNaN(time) || (time && (time < 0 || time > 180)))
    throw new Error("Invalid time");

  return {
    date,
    digits: digits.toSorted(),
    solutions,
    time,
    score,
  };
}

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  try {
    const { date, digits, solutions, time, score } =
      validateAndNormalizeRequest(body);

    const dynamoItem = {
      UserID: { S: "" },
      Date: { S: date },
      Digits: { L: digits.map((digit) => ({ N: String(digit) })) },
      Solutions: {
        M: Object.fromEntries(
          Object.entries(solutions).map(([k, v]) => [k, { S: v }])
        ),
      },
      Time: { N: String(time) },
      Score: { N: String(score) },
    };

    const client = new DynamoDBClient({
      region: "us-east-2",
    });
    const input = {
      RequestItems: {
        "number-boggle": [
          {
            PutRequest: {
              Item: dynamoItem,
            },
          },
        ],
      },
    };

    const command = new BatchWriteItemCommand(input);
    await client.send(command);

    const response = {
      statusCode: 200,
      body: JSON.stringify(event),
    };
    return response;
  } catch (e) {
    return {
      statusCode: 401,
      body: {
        error: e,
      },
    };
  }
};

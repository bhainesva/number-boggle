interface Submission {
  name: string;
  digits: string[];
  solutions: Record<string, string>;
  time: number;
  score: number;
  date: string;
}

export const submitScore = async (submission: Submission) => {
  return fetch(
    "https://sgguiejsi2aocea56ldquympqy0qzxlk.lambda-url.us-east-2.on.aws/",
    {
      method: "POST",
      body: JSON.stringify(submission),
    }
  );
  // return await new Promise((r) => setTimeout(r, 2000));
};

export const fetchScores = async (date: string) => {
  return await fetch(
    "https://nd7enj7cyf3wbkoago36jyx36a0irash.lambda-url.us-east-2.on.aws/",
    {
      method: "POST",
      body: JSON.stringify({
        date,
      }),
    }
  ).then((r) => r.json());

  // return {
  //   $metadata: {
  //     httpStatusCode: 200,
  //     requestId: "19SP9CB2R3FMCK93ESELP3PFT7VV4KQNSO5AEMVJF66Q9ASUAAJG",
  //     attempts: 1,
  //     totalRetryDelay: 0,
  //   },
  //   Items: [
  //     {
  //       UserID: { S: "ben" },
  //       Time: { N: "0" },
  //       Score: { N: "18" },
  //       Solutions: {
  //         M: {
  //           "1": { S: "4 - 3 + 2 - 2" },
  //           "2": { S: "3 - (2/2)^4" },
  //           "3": { S: "4 + 3 - 2 - 2" },
  //           "4": { S: "4 * (2/2)^3" },
  //           "5": { S: "4 + (2/2)^3" },
  //           "6": { S: "4 + 3 -  (2/2)" },
  //           "7": { S: "4 + 3 + 2 - 2" },
  //           "8": { S: "4 + 3 +  (2/2)" },
  //           "10": { S: "(4 + 3 - 2) * 2" },
  //           "11": { S: "4 + 3 + 2 + 2" },
  //           "12": { S: "4 * 3 * (2/2)" },
  //           "13": { S: "4 * 3 + (2/2)" },
  //           "14": { S: "" },
  //           "15": { S: "2^4 -(3-2)" },
  //           "16": { S: "2^4(3-2)" },
  //           "17": { S: "2^4 +(3-2)" },
  //           "18": { S: "(4+2) * 3!/2" },
  //           "19": { S: "2^4 + 3!/2" },
  //           "20": { S: "3! * 4 -2 - 2" },
  //         },
  //       },
  //     },
  //     {
  //       UserID: { S: "owen" },
  //       Time: { N: "100" },
  //       Score: { N: "20" },
  //       Solutions: {
  //         M: {
  //           "1": { S: "4 - 3 + 2 - 2" },
  //           "2": { S: "3 - (2/2)^4" },
  //           "3": { S: "4 + 3 - 2 - 2" },
  //           "4": { S: "4 * (2/2)^3" },
  //           "5": { S: "4 + (2/2)^3" },
  //           "6": { S: "4 + 3 -  (2/2)" },
  //           "7": { S: "4 + 3 + 2 - 2" },
  //           "8": { S: "4 + 3 +  (2/2)" },
  //           "9": { S: "2*4 + (3-2)" },
  //           "10": { S: "(4 + 3 - 2) * 2" },
  //           "11": { S: "4 + 3 + 2 + 2" },
  //           "12": { S: "4 * 3 * (2/2)" },
  //           "13": { S: "4 * 3 + (2/2)" },
  //           "14": { S: "3! + 4 + 2 + 2" },
  //           "15": { S: "2^4 -(3-2)" },
  //           "16": { S: "2^4(3-2)" },
  //           "17": { S: "2^4 +(3-2)" },
  //           "18": { S: "(4+2) * 3!/2" },
  //           "19": { S: "2^4 + 3!/2" },
  //           "20": { S: "3! * 4 -2 - 2" },
  //         },
  //       },
  //     },
  //     {
  //       UserID: { S: "raewyn" },
  //       Time: { N: "81" },
  //       Score: { N: "20" },
  //       Solutions: {
  //         M: {
  //           "1": { S: "4 - 3 + 2 - 2" },
  //           "2": { S: "4/2 * (3-2)" },
  //           "3": { S: "4 + 3 - 2 - 2" },
  //           "4": { S: "4 * (2/2)^3" },
  //           "5": { S: "4 + (2/2)^3" },
  //           "6": { S: "4 + 3 -  (2/2)" },
  //           "7": { S: "4 + 3 + 2 - 2" },
  //           "8": { S: "4 + 3 +  (2/2)" },
  //           "9": { S: "2*4 + (3-2)" },
  //           "10": { S: "(4 + 3 - 2) * 2" },
  //           "11": { S: "4 + 3 + 2 + 2" },
  //           "12": { S: "4 * 3 * (2/2)" },
  //           "13": { S: "4 * 3 + (2/2)" },
  //           "14": { S: "3! + 4 + 2 + 2" },
  //           "15": { S: "2^4 -(3-2)" },
  //           "16": { S: "2^4(3-2)" },
  //           "17": { S: "2^4 +(3-2)" },
  //           "18": { S: "(4+2) * 3!/2" },
  //           "19": { S: "2^4 + 3!/2" },
  //           "20": { S: "3! * 4 -2 - 2" },
  //         },
  //       },
  //     },
  //   ],
  // };
};

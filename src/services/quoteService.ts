import { AppError, CommonError } from "../types/AppError";
import * as Type from "../types/quotes";
import { openai } from "../config/config";
import * as quoteModel from "../models/quoteModel";

// openAi 의 createCompletion 함수로 입력값에 대한 결과값 문장 생성
const createCompletion = async (params: Type.Quotes) => {
  try {
    const {
      chat: {
        prompt,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
      },
    } = params;
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt, // 입력 문장 또는 질문
      temperature: temperature, // 높을 수록 예측하지 못하는 답변
      max_tokens: maxTokens, // AI가 생성할 때 사용하는 최대 토큰 수
      top_p: topP, // 높을 수록 다양한 답변
      frequency_penalty: frequencyPenalty, // 높을 수록 AI가 이미 자주 등장한 단어를 피함
      presence_penalty: presencePenalty, // 높을 수록 AI가 새로운 단어나 문장을 생성하도록 유도
    });
    if (response) {
      return response;
    }
    throw new AppError(
      CommonError.SERVER_ERROR,
      "OpenAi 서버 오류로 인해 completion을 생성하지 못했습니다",
      503
    );
  } catch (error) {
    throw error;
  }
};

export const searchQuotesToChat = async (message: string) => {
  try {
    const params: Type.Quotes = {
      chat: {
        prompt: message,
        temperature: 0.9,
        maxTokens: 3500,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0.6,
      },
    };
    const response = await createCompletion(params);
    if (response.data.choices) {
      const text = String(response.data.choices[0].text).trim();
      return text;
    }
    throw new AppError(
      CommonError.SERVER_ERROR,
      "OpenAi 서버 오류로 인해 챗을 생성하지 못했습니다",
      503
    );
  } catch (error) {
    throw error;
  }
};

export const createTableIfNotExists = async (
  tableName: string
): Promise<void> => {
  try {
    // Call the model function to create the table
    await quoteModel.createTableIfNotExists(tableName);
  } catch (error) {
    console.error("Error while creating the table:", error);
    throw new AppError(
      CommonError.UNEXPECTED_ERROR,
      "테이블 생성에 실패했습니다.",
      500
    );
  }
};

export const updateQuotesInDB = async (keyword: string, jsonData: any) => {
  const authorQuotes: { [author: string]: { quote: string }[] } = {};

  for (const quoteData of jsonData.quotes) {
    const { quote, author } = quoteData;

    if (author in authorQuotes) {
      authorQuotes[author].push({ quote });
    } else {
      authorQuotes[author] = [{ quote }];
    }
  }

  for (const author in authorQuotes) {
    const quotesArray = authorQuotes[author];
    const quotesJSON = JSON.stringify(quotesArray);

    // 모델로 분리한 로직 호출
    await quoteModel.insertOrUpdateQuotes(keyword, author, quotesJSON);
  }
};

export const updateData = async () => {
  try {
    await quoteModel.updateData();
    const authorStats = await quoteModel.getAuthorStats();
    console.log("Total Authors:", authorStats.totalAuthors);
    console.log("Total Quote Count:", authorStats.totalQuoteCount);
    return authorStats;
  } catch (err) {
    console.error("Error updating data:", err);
    throw err;
  }
};

export const getQuotesByAuthor = async (
  keyword: Type.Search,
  author: Type.Search
) => {
  try {
    const result = await quoteModel.getQuotesByAuthor(keyword, author);

    // 데이터의 형식이 맞지 않으면 오류 처리
    if (
      !Array.isArray(result) ||
      result.length === 0 ||
      !("quotes" in result[0])
    ) {
      console.error("데이터 형식이 올바르지 않습니다.");
      return [];
    }

    // 명언들 추출
    const quotesData = JSON.parse(result[0].quotes);
    const quotes: string[] = quotesData.map(
      (quoteItem: { quote: string }) => quoteItem.quote
    );

    console.log(quotes);
    return quotes;
  } catch (error) {
    console.error("데이터 찾는 중 오류", error);
    throw error;
  }
};

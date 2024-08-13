import { NextApiReponse, NextApiRequest} from "next";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Ollama } from "@langchain/ollama";
import { VectorDBQAChainV2 } from "langchain/chains";

export default async function handler(req = NextApiRequest, res = NextApiReponse) {
    if (req.method !== "POST"){
        throw new Error("Method not allowed");
    }
    const userQuestion = req.body.question;
    console.log("User Question: ", userQuestion);
    
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    
    const vectorStore = await PineconeStore.fromExistingIndex(
        new GoogleGenerativeAIEmbeddings(),
        {pineconeIndex}
    );

    const model = new Ollama();
    const chain = VectorDBQAChainV2.fromLLM(model, vectorStore, {
        k:2,
        returnSourceDocuments: true,
    });
    const response = await chain.call({ query: userQuestion });
    console.log(response);

    res.status(200).json({ message: response.text });
}
import React from 'react'
import { useState, useEffect } from "react"


const App = () => {
  
  const API_BASE_URL = "https://opentdb.com/api.php?amount=10";

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
    }
  }

  const fetchQuestions = async () => {
    try{  
      const SESSION_TOKEN_LINK = "https://opentdb.com/api_token.php?command=request";

      const sessionToken = await fetch(SESSION_TOKEN_LINK, API_OPTIONS);

      if(!sessionToken.ok){
        throw new Error("Failed fetching Session Token");
      }

      const sessionTokenData = await sessionToken.json();

      const endpoint = `${API_BASE_URL}&token=${sessionTokenData.token}&difficulty=easy`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error("Failed fetching questions");
      }

      const data = await response.json();

      console.log(data);
    }
    catch(error){
      console.error(`Failed to fetch questions: ${error}`);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [])
  
  return (
    <div>
      <h1>Question</h1>
      <p>List</p>
    </div>
  )
}

export default App
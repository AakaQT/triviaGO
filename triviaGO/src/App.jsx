import React from 'react'
import { useState, useEffect } from "react"


const App = () => {

  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  const API_BASE_URL = "https://opentdb.com/api.php?amount=10";

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
    }
  }

  const fetchQuestions = async () => {
    try{  
      // Getting the session token
      const SESSION_TOKEN_LINK = "https://opentdb.com/api_token.php?command=request";

      const sessionToken = await fetch(SESSION_TOKEN_LINK, API_OPTIONS);

      if(!sessionToken.ok){
        throw new Error("Failed fetching Session Token");
      }

      const sessionTokenData = await sessionToken.json();

      // Getting the questions
      const endpoint = `${API_BASE_URL}&token=${sessionTokenData.token}&difficulty=easy`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error("Failed fetching questions");
      }

      const data = await response.json();

      setQuestions(data.results);

      console.log(data);
    }
    catch(error){
      console.error(`Failed to fetch questions: ${error}`);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [])

  const handleAnswerClick = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
    console.log(`Selected: ${answer}`);
  }

  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
  
  return (
    <div>
      {questions.map((question, index) => (
        <div key={index} className="border-[1px] border-gray-300 text-center max-w-[500px] ml-auto mr-auto mb-[15px] rounded-[20px] mt-[10px] p-[10px]">
          <h3>{decodeHtml(question.question)}</h3>
          <div>
            {[...question.incorrect_answers, question.correct_answer]
            .sort(() => Math.random() - 0.5)
            .map((answer, answerIndex) => {
              const isSelected = selectedAnswers[index] === answer;
              const isAnswered = selectedAnswers.hasOwnProperty(index);

              return(
                <>
                <button key={answerIndex} className="border-[1px] border-gray-300 mb-[10px] max-w-[400px] ml-auto mr-auto rounded-[20px] mt-[10px] block min-w-[300px]" style={{
                  cursor: isAnswered ? "not-allowed" : "pointer",
                  opacity: isAnswered && !isSelected ? 0.4 : 1,
                  backgroundColor: isSelected ? "#007bff" : "#f8f9fa",
                  color: isSelected ? 'white' : 'black'
                }}
                disabled={isAnswered}
                onClick={() => handleAnswerClick(index, answer)}
                >
                  {decodeHtml(answer)}
                </button>
                </>
              );
            })
            }
          </div>
          {selectedAnswers.hasOwnProperty(index) && (
            <p><strong>Correct Answer:</strong> {question.correct_answer}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default App
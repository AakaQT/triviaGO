import React from 'react'
import { useState, useEffect } from "react"


const App = () => {

  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [difficulty, setDifficulty] = useState("easy");
  const [length, setLength] = useState("10");
  
  const API_BASE_URL = "https://opentdb.com/api.php?amount=";

  const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" }
  ]

  const lengths = [
    { value: "10", label: "Short" },
    { value: "20", label: "Medium" },
    { value: "30", label: "Long" }
  ]

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
    }
  }

  const fetchQuestions = async () => {
    
    setSelectedAnswers({});
    try{  
      // Getting the session token
      const SESSION_TOKEN_LINK = "https://opentdb.com/api_token.php?command=request";

      const sessionToken = await fetch(SESSION_TOKEN_LINK, API_OPTIONS);

      if(!sessionToken.ok){
        throw new Error("Failed fetching Session Token");
      }

      const sessionTokenData = await sessionToken.json();

      // Getting the questions
      const endpoint = `${API_BASE_URL}${length}&token=${sessionTokenData.token}&difficulty=${difficulty}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error("Failed fetching questions");
      }

      const data = await response.json();

      setQuestions(data.results);
    }
    catch(error){
      console.error(`Failed to fetch questions: ${error}`);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [])

  useEffect(() => {
    fetchQuestions();
  }, [difficulty])

  useEffect(() => {
    fetchQuestions();
  }, [length])

  const handleAnswerClick = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
    console.log(`Selected: ${answer}`);
  }

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  }

  const handleNewQuiz = () => {
    fetchQuestions();
  }

  const handleLengthChange = (e) => {
    setLength(e.target.value);
  }

  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
  
  return (
    <div>
    <div className="sticky top-0">
      <h2>Quiz settings</h2>

      <div>
        <label htmlFor="difficulty">Difficulty: </label>
        <select id="difficulty" value={difficulty} onChange={handleDifficultyChange}>
          {difficulties.map(diff => (
            <option key={diff.value} value={diff.value}>
              {diff.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="length">Length: </label>
        <select id="length" value={length} onChange={handleLengthChange}>
          {lengths.map(len => (
            <option key={len.value} value={len.value}>
              {len.label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleNewQuiz}>New quiz</button>
    </div>
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
            <p><strong>Correct Answer:</strong> {decodeHtml(question.correct_answer)}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default App
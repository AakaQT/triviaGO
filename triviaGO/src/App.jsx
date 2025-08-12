import React from 'react'
import { useState, useEffect } from "react"


const App = () => {

  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [difficulty, setDifficulty] = useState("easy");
  const [length, setLength] = useState("10");
  const [category, setCategory] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  
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

  const categories = [
    { value: "", label: "Any category" },
    { value: "9", label: "General Knowledge" },
    { value: "10", label: "Entertainment: Books" },
    { value: "11", label: "Entertainment: Film" },
    { value: "12", label: "Entertainment: Music" },
    { value: "17", label: "Science & Nature" },
    { value: "18", label: "Science: Computers" },
    { value: "19", label: "Science: Mathematics" },
    { value: "21", label: "Sports" },
    { value: "22", label: "Geography" },
    { value: "23", label: "History" }
  ]

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
    }
  }

  const fetchSessionToken = async () => {
    try{
      const SESSION_TOKEN_LINK = "https://opentdb.com/api_token.php?command=request";

      const response = await fetch(SESSION_TOKEN_LINK, API_OPTIONS);

      if(!response.ok){
        throw new Error("Failed fetching Session Token");
      }

      const data = await response.json();

      setSessionToken(data.token);
    }
    catch(error){
      console.error(error);
    }
  }

  useEffect(() => {
    fetchSessionToken();
  }, [])

  const fetchQuestions = async () => {
    
    setSelectedAnswers({});
    try{
      // Getting the questions
      console.log(sessionToken);
      const endpoint = `${API_BASE_URL}${length}&token=${sessionToken}&difficulty=${difficulty}&category=${category}`;

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
  }, [sessionToken])

  useEffect(() => {
    fetchQuestions();
  }, [difficulty])

  useEffect(() => {
    fetchQuestions();
  }, [length])
  
  useEffect(() => {
    fetchQuestions();
  }, [category])

  const handleAnswerClick = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
    console.log(`Selected: ${answer}`);
  }

  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const correctAnswers = Object.keys(selectedAnswers).filter(
    questionIndex => selectedAnswers[questionIndex] === questions[questionIndex]?.correct_answer
  ).length;
  const isQuizComplete = answeredQuestions === totalQuestions && totalQuestions > 0;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  }

  const handleNewQuiz = () => {
    fetchQuestions();
  }

  const handleLengthChange = (e) => {
    setLength(e.target.value);
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  }

  const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
  
  return (
    <div>
    <div className="sticky top-0 bg-gray-100 border-[1px] border-gray-300">
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
      <div>
        <label htmlFor="category">Category: </label>
        <select id="category" value={category} onChange={handleCategoryChange}>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleNewQuiz} className="cursor-pointer">New quiz</button>
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
                onClick={() => {
                  handleAnswerClick(index, answer);
                }}
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

      {isQuizComplete && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg w-[300px] border-[1px] border-gray-300 text-center ">
          <h2>Quiz Complete!</h2>

          <div>
            <div>
              <h3>Score</h3>
              <p>{percentage}%</p>
            </div>

            <div>
              <h3>Correct Answers</h3>
              <p>{correctAnswers} / {totalQuestions}</p>
            </div>
          </div>

          <div>
            {percentage >= 90 && <p>Excellent Work!</p>}
            {percentage >= 70 && percentage < 90 && <p>Great job!</p>}
            {percentage >= 50 && percentage < 70 && <p>Not bad!</p>}
            {percentage < 50 && <p>Keep practicing!</p>}
          </div>
          <button className="border-[1px] border-gray-300 w-[150px] h-[50px] mt-[10px] rounded-[10px] cursor-pointer" onClick={handleNewQuiz}>New Quiz</button>
        </div>
      )}

      {!isQuizComplete && totalQuestions > 0 && (
        <div>
          Progress: {answeredQuestions / {totalQuestions}}
        </div>
      )}
    </div>
  )
}

export default App
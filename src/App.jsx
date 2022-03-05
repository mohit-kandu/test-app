import './App.css';
import TaskList from './components/TaskList';
import { useState } from "react"

function App() {
  const [queryType, setQueryType] = useState("message")
  const [query, setQuery] = useState("")
  return (
    <div className='container'>
      <h3 className='search_title'>Search task(s) from the list.</h3>
      <p className='search_title'>Select a category and start typing.</p>
      <nav className='nav'>
        <select name="queryType"
          id="queryType"
          value={queryType}
          onChange={e => setQueryType(e.target.value)}
        >
          <option value="id">Task ID</option>
          <option value="message">Message</option>
          <option value="assigned_to">Assigned To</option>
          <option value="assigned_name">Assigned By</option>
          <option value="created_on">Date Created</option>
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
        </select>
        <label htmlFor=""></label>
        <input type="search"
          name="search_bar"
          id="search_bar"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </nav>
      <TaskList
        query={query}
        queryType={queryType}
      />
    </div>
  );
}

export default App;

import { useState, useRef } from "react"
import axios from "axios"
import "./Task.css"
import { PuffLoader } from "react-spinners"

export default function Task({ task, openEditModal, setEditTask }) {
    const { id, message, assigned_to, assigned_name, created_on, due_date, priority } = task
    const [deleting, setDeleting] = useState(false)
    const taskRef = useRef()

    const deleteTask = async (id) => {
        setDeleting(true)
        taskRef.current.classList.toggle("fading")
        const data = new FormData()
        data.append("taskid", id)
        await axios.post(process.env.REACT_APP_DELETE_TASK, data, {
            headers: {
                AuthToken: process.env.REACT_APP_AUTH_TOKEN
            }
        })
            .then(resp => {
                console.log(resp)
                // setDeleting(false)
                window.location.reload()
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <div ref={taskRef} className='task'>
            <div className='task_details'>
                <p>Task ID: {id}</p>
                <p>Message: {message}</p>
                <p>Assigned To: {assigned_to}</p>
                <p>Assigned By: {assigned_name}</p>
                <p>Created: {created_on}</p>
                <p>Due Date: {due_date}</p>
                <p>Priority: {priority}</p>
                <div className='task_buttons'>
                    <button onClick={() => deleteTask(id)}>Delete Task {deleting && <div className="puffLoader"> <PuffLoader size={100} /></div>} </button>
                    <button onClick={() => {
                        openEditModal()
                        setEditTask(task)
                    }}>Update Task</button>
                </div>
            </div>
        </div>
    )
}

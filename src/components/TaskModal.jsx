import { useState } from 'react'
import Modal from 'react-modal';
import axios from "axios"
import "./TaskModal.css"
import { PuffLoader } from "react-spinners"


Modal.setAppElement('#root');

export default function TaskModal({
    userList,
    modalIsOpen,
    setModalIsOpen,
}) {
    const [message, setMessage] = useState('')
    const [messageError, setMessageError] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [priority, setPriority] = useState(2)
    const [assignTo, setAssignTo] = useState('')
    const [creating, setCreating] = useState(false)
    const [createSuccess, setCreateSuccess] = useState(false)

    const createTask = async (data) => {
        await axios.post(process.env.REACT_APP_CREATE_TASK, data, {
            headers: {
                AuthToken: process.env.REACT_APP_AUTH_TOKEN
            }
        })
            .then(resp => {
                console.log(resp)
                setCreating(false)
                setCreateSuccess(true)
            })
            .catch(err => {
                console.log(err)
                setCreating(false)
            })
    }


    function closeModal() {
        setModalIsOpen(false);
        setCreateSuccess(false)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setCreating(true)
        //handle empty message
        if (message === '') {
            setMessageError("Message cannot be empty")
            return
        }
        const data = new FormData()
        data.append('message', message)
        data.append('due_date', dueDate.replace("T", " "))
        data.append('priority', priority)
        data.append('assigned_to', assignTo)

        // create task
        createTask(data)
    }

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Create Task Modal"
            className="createModal"
        >
            <div className="modal_close_button">
                <button onClick={closeModal}>close</button>
            </div>
            <h3>Create new task</h3>
            <form onSubmit={handleSubmit}>
                {
                    messageError && <p style={{ color: "red" }}>{messageError}</p>
                }
                {/* message input */}
                <div className="form-element">
                    <label htmlFor="message">Message:</label>
                    <input name="messageInput" id="message" type="text" value={message} onChange={(e) => {
                        setMessage(e.target.value)
                        setMessageError('')
                    }} />
                </div>
                {/* due date input */}
                <div className="form-element">
                    <label htmlFor="due_date">Due Date:</label>
                    <input type="datetime-local" step="1" name="dueDateInput" id="due_date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                {/* priority input */}
                <div className="form-element">
                    <label htmlFor="priority">Priority:</label>
                    <input name="priorityInput" id="priority" type="number" min="1" max="3" value={priority} onChange={(e) => setPriority(e.target.value)} />
                </div>
                {/* assign to input */}
                <div className="form-element">
                    <label htmlFor="assigned_to">Assign To:</label>
                    {
                        <select name="assignToInput" id="assigned_to" defaultValue={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                            {
                                userList.map((user, index) => <option key={`user${index}`} value={user.name}>{user.name}</option>)
                            }
                        </select>
                    }
                </div>
                {
                    createSuccess ? <p style={{ color: "green" }}>Task Created Successfully</p> : <button type="submit"> <div>{creating && <PuffLoader className="puffLoader" />}</div> Create Task  </button>
                }
            </form>
        </Modal>
    )
}

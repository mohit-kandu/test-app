import { useState, useEffect } from 'react'
import Modal from 'react-modal';
import axios from "axios"
import { PuffLoader } from "react-spinners"


Modal.setAppElement('#root');

export default function UpdateTaskModal({
    userList,
    modalIsOpen,
    setModalIsOpen,
    editTask,
}) {
    const [message, setMessage] = useState('')
    const [messageError, setMessageError] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [priority, setPriority] = useState(2)
    const [assignTo, setAssignTo] = useState('')
    const [updating, setUpdating] = useState(false)
    const [updateSuccess, setUpdatingSuccess] = useState(false)

    useEffect(() => {
        setMessage(editTask.message)
        setDueDate(editTask?.due_date?.replace(" ", "T"))
        setPriority(editTask.priority)
        setAssignTo(editTask.assigned_to)
    }, [editTask])

    console.log({ editTask })

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };


    const updateTask = async (data) => {
        setUpdating(true)
        await axios.post(process.env.REACT_APP_UPDATE_TASK, data, {
            headers: {
                AuthToken: process.env.REACT_APP_AUTH_TOKEN
            }
        })
            .then(resp => {
                console.log(resp)
                setUpdating(false)
                setUpdatingSuccess(true)
            })
            .catch(err => {
                console.log(err)
                setUpdating(false)
            })
    }

    function closeEditModal() {
        setModalIsOpen(false);
        setUpdatingSuccess(false)
    }
    const handleSubmit = (e) => {
        e.preventDefault()
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
        data.append('taskid', editTask.id)

        //        update task
        updateTask(data)
    }

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeEditModal}
            style={customStyles}
            contentLabel="Update Task Modal"
        >
            <div className="modal_close_button">
                <button onClick={closeEditModal}>close</button>
            </div>
            <h3>Update task</h3>
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
                        <select name="assignToInput" id="assigned_to" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                            {
                                userList.map((user, index) => <option key={`user${index}`} value={user.name}>{user.name}</option>)
                            }
                        </select>
                    }
                </div>
                {
                    updateSuccess ? <p style={{ color: "green" }}>Task Updated Successfully</p> : <button type="submit"> <div>{updating && <PuffLoader className="puffLoader" />}</div> Update Task  </button>
                }

            </form>
        </Modal>
    )
}

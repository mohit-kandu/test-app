import { useState, useEffect } from "react"
import axios from "axios"
import Task from "./Task"
import "./TaskList.css"
import TaskModal from "./TaskModal"
import UpdateTaskModal from "./UpdateTaskModal"

export default function TaskList({ query, queryType }) {
    const [taskList, setTaskList] = useState([])
    const [userList, setUserList] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [editModalIsOpen, setEditModalIsOpen] = useState(false)
    const [editTask, setEditTask] = useState({})
    const [filterByPriority, setFilterByPriority] = useState(window.localStorage.getItem("showFilteredList") === "true" ? true : false)
    const [priorityTaskList, setPriorityTaskList] = useState([])
    useEffect(() => {
        try {
            if (query !== "") {
                let foundTasks = []
                taskList.forEach(task => {
                    console.log(task[`assigned_to`])
                    if (task[`${queryType}`] && task[`${queryType}`].includes(query)) {
                        foundTasks.push(task)
                    }
                })
                setTaskList(foundTasks)
            }
            else {
                getList()
            }
        } catch (error) {
            console.log(error)
        }

    }, [query])

    // Get users
    useEffect(() => {
        const getUserList = async () => {
            await axios(process.env.REACT_APP_LIST_USERS, {
                headers: {
                    AuthToken: process.env.REACT_APP_AUTH_TOKEN
                }
            })
                .then(resp => {
                    if (resp.data.status === "success")
                        setUserList(resp.data.users)
                })
                .catch(err => {
                    console.log(err)

                })
        }
        getUserList()
    }, [])

    useEffect(() => {
        getList()
    }, [])

    const getList = async () => {
        setLoading(true)
        await axios(process.env.REACT_APP_TASK_LIST,
            {
                headers: {
                    AuthToken: process.env.REACT_APP_AUTH_TOKEN
                }
            })
            .then(resp => {
                if (resp.data.status === "success") {
                    setTaskList(resp.data.tasks)
                    handleFilterByPriority("noToggle", resp.data.tasks)
                    setLoading(false)
                }
            })
            .catch(err => {
                console.log(err)
                setLoading(false)
            })
    }
    function openModal() {
        setModalIsOpen(true);
    }
    function openEditModal() {
        setEditModalIsOpen(true);
    }

    const handleFilterByPriority = (toggle = "toggle", tasks) => {
        if (toggle === "toggle") {
            window.localStorage.setItem("showFilteredList", !filterByPriority)
            setFilterByPriority(!filterByPriority)
        }
        let filteredTasksObj = {
            priority_1: [],
            priority_2: [],
            priority_3: []
        }
        const temp = taskList.length > 0 ? taskList : tasks
        temp.forEach(task => {
            if (parseInt(task.priority, 10) === 1) {
                filteredTasksObj[`priority_1`].push(task)
            }
            else if (parseInt(task.priority, 10) === 2) {
                filteredTasksObj[`priority_2`].push(task)
            }
            else {
                filteredTasksObj[`priority_3`].push(task)
            }
        })
        setPriorityTaskList(filteredTasksObj)
    }

    // 
    const handleSubmit = (priority) => {

        const data = new FormData()
        data.append('message', editTask.message)
        data.append('due_date', editTask.dueDate.replace("T", " "))
        data.append('priority', priority)
        data.append('assigned_to', editTask.assignTo)
        data.append('taskid', editTask.id)

        //        update task
        updateTask(data)
    }
    const updateTask = async (data) => {

        await axios.post(process.env.REACT_APP_UPDATE_TASK, data, {
            headers: {
                AuthToken: process.env.REACT_APP_AUTH_TOKEN
            }
        })
            .then(resp => {
                console.log(resp)
                alert("save success")
            })
            .catch(err => {
                console.log(err)
            })
    }

    //  drag and drop functionality
    const onDragStart = (e, id) => {
        e.dataTransfer.setData("text/plain", id);
        console.log('dragstart:', id);
    }

    const onDragOver = (e, id) => {
        e.preventDefault()
    }
    const onDrop = (e, priority) => {
        let id = e.dataTransfer.getData("text/plain")
        // handleSubmit(priority)
        let temp = taskList.map(task => {
            if (task.id === id) {
                task.priority = priority
            }
            return task
        })
        setTaskList(temp)
        handleFilterByPriority("noToggle", taskList)

    }
    // 
    return (
        <>
            <header style={{ maxWidth: "30em", marginInline: "auto" }}>
                <div>Tasks</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {/* create task */}
                    <button onClick={openModal}>Create New Task</button>
                    {/* filter by priority */}
                    <div style={{ display: "flex", gap: ".5em", alignItems: "center" }}>
                        <label htmlFor="priority">Priority</label>
                        <button onClick={() => handleFilterByPriority("toggle", taskList)}>Toggle Priority Filter</button>
                    </div>
                </div>

            </header>
            <TaskModal
                userList={userList}
                modalIsOpen={modalIsOpen}
                setModalIsOpen={setModalIsOpen}
            />


            <div>
                {
                    loading ?
                        <p>Loading list...</p>
                        :
                        <div className="task_container">
                            {
                                filterByPriority ?
                                    <div>
                                        <div className="filteredGrid">
                                            <div className="">
                                                <h3 style={{ textAlign: "center", color: "white" }}>Priority: High</h3>
                                                {
                                                    priorityTaskList.priority_3.map((task, index) => {
                                                        return <div
                                                            draggable
                                                            onDragStart={(e) => onDragStart(e, task.id)}
                                                            onDragOver={e => onDragOver(e)}
                                                            onDrop={e => onDrop(e, 3)}
                                                            className="cursor-pointer draggable priority_3">
                                                            <Task
                                                                key={`priority_3_task${index}`}
                                                                task={task}
                                                                openEditModal={openEditModal}
                                                                setOpenEditModal={setEditModalIsOpen}
                                                                setEditTask={setEditTask}
                                                                getList={getList}
                                                            />
                                                        </div>
                                                    })
                                                }
                                            </div>
                                            <div className="">
                                                <h3 style={{ textAlign: "center", color: "white" }}>Priority: Medium</h3>
                                                {
                                                    priorityTaskList.priority_2.map((task, index) => {
                                                        return <div
                                                            draggable
                                                            onDragStart={(e) => onDragStart(e, task.id)}
                                                            onDragOver={e => onDragOver(e)}
                                                            onDrop={e => onDrop(e, 2)}
                                                            className="cursor-pointer draggable priority_2"
                                                        >
                                                            <Task
                                                                key={`priority_2_task${index}`}
                                                                task={task}
                                                                openEditModal={openEditModal}
                                                                setOpenEditModal={setEditModalIsOpen}
                                                                setEditTask={setEditTask}
                                                                getList={getList}
                                                            />
                                                        </div>
                                                    })
                                                }
                                            </div>
                                            <div className="">
                                                <h3 style={{ textAlign: "center", color: "white" }}>Priority: Low</h3>
                                                {
                                                    priorityTaskList.priority_1.map((task, index) => {
                                                        return <div
                                                            draggable
                                                            onDragStart={(e) => onDragStart(e, task.id)}
                                                            onDragOver={e => onDragOver(e)}
                                                            onDrop={e => onDrop(e, 1)}
                                                            className="cursor-pointer draggable priority_1"
                                                        >
                                                            <Task
                                                                key={`priority_1_task${index}`}
                                                                task={task}
                                                                openEditModal={openEditModal}
                                                                setOpenEditModal={setEditModalIsOpen}
                                                                setEditTask={setEditTask}
                                                                getList={getList}
                                                            />
                                                        </div>
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div style={{ maxWidth: "30em" }}>
                                        {
                                            taskList.map((task, index) => <Task
                                                key={`task${index}`}
                                                task={task}
                                                openEditModal={openEditModal}
                                                setOpenEditModal={setEditModalIsOpen}
                                                setEditTask={setEditTask}
                                                getList={getList}
                                            />)
                                        }
                                    </div>


                            }
                        </div>
                }

            </div>
            <div>
                <UpdateTaskModal
                    userList={userList}
                    modalIsOpen={editModalIsOpen}
                    setModalIsOpen={setEditModalIsOpen}
                    editTask={editTask}
                />

            </div>
        </>
    )
}

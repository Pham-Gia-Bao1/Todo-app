"use client";
import React, { useReducer, useState, useEffect } from "react";
import Draggable from "react-draggable";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";

// Initial tasks and columns
const initialTasks = JSON.parse(localStorage.getItem("tasks")) || [
  {
    id: 1,
    title: "Task 1",
    status: "todo",
    details:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Libero minus velit blanditiis sit quod ipsum ducimus in illo facilis. Voluptatibus in qui dolorem! Fugit, quasi! Quo voluptatem possimus animi. Soluta!",
    deadline: "2024-08-20", // Example deadline
  },
  { id: 2, title: "Task 2", status: "doing", details: "Details for Task 2", deadline: "2024-08-22" },
  { id: 3, title: "Task 3", status: "done", details: "Details for Task 3", deadline: "2024-08-25" },
];

const initialColumns = JSON.parse(localStorage.getItem("columns")) || [
  { status: "todo", color: "#5AB2FF" },
  { status: "doing", color: "#FFB200" },
  { status: "done", color: "#4CCD99" },
];

function reducer(state, action) {
  switch (action.type) {
    case "CREATE_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((item) => item.id !== action.payload.id),
      };

    case "UPDATE_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((item) =>
          item.id === action.payload.id
            ? { ...item, status: action.payload.status }
            : item
        ),
      };

    case "CREATE_COLUMN":
      return {
        ...state,
        columns: [
          ...state.columns,
          { status: action.payload, color: "#B0B0B0" }, // Default color
        ],
      };

    case "UPDATE_COLUMN_COLOR":
      return {
        ...state,
        columns: state.columns.map((col) =>
          col.status === action.payload.status
            ? { ...col, color: action.payload.color }
            : col
        ),
      };

    case "DELETE_COLUMN":
      return {
        ...state,
        columns: state.columns.filter(
          (col) => col.status !== action.payload.status
        ),
        tasks: state.tasks.filter(
          (task) => task.status !== action.payload.status
        ),
      };

    default:
      return state;
  }
}

export default function Todo() {
  const [state, dispatch] = useReducer(reducer, {
    tasks: initialTasks,
    columns: initialColumns,
  });

  const [taskInputValue, setTaskInputValue] = useState("");
  const [taskDetailValue, setTaskDetailValue] = useState("");
  const [taskDeadlineValue, setTaskDeadlineValue] = useState(""); // State for deadline
  const [columnInputValue, setColumnInputValue] = useState("");
  const [colorInputValue, setColorInputValue] = useState("#000000");

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(state.tasks));
    localStorage.setItem("columns", JSON.stringify(state.columns));
  }, [state]);

  const handleAddTask = () => {
    dispatch({
      type: "CREATE_TASK",
      payload: {
        id: state.tasks.length + 1,
        title: taskInputValue,
        details: taskDetailValue,
        deadline: taskDeadlineValue, // Add deadline to task
        status: state.columns[0].status, // Assign the task to the first column
      },
    });
    setTaskInputValue(""); // Clear input after adding
    setTaskDetailValue(""); // Clear details after adding
    setTaskDeadlineValue(""); // Clear deadline after adding
  };

  const handleDeleteTask = (id) => {
    dispatch({ type: "DELETE_TASK", payload: { id: id } });
  };

  const handleStatusChange = (id, status) => {
    dispatch({ type: "UPDATE_STATUS", payload: { id: id, status: status } });
  };

  const handleAddColumn = () => {
    if (columnInputValue.trim()) {
      dispatch({ type: "CREATE_COLUMN", payload: columnInputValue.trim() });
      setColumnInputValue(""); // Clear input after adding
    }
  };

  const handleDeleteColumn = (status) => {
    dispatch({ type: "DELETE_COLUMN", payload: { status } });
  };

  const handleColorChange = (status, color) => {
    dispatch({
      type: "UPDATE_COLUMN_COLOR",
      payload: { status: status, color: color },
    });
  };

  const onDrop = (e, status) => {
    const id = e.dataTransfer.getData("id");
    handleStatusChange(parseInt(id), status);
  };

  const onDragStart = (e, id) => {
    e.dataTransfer.setData("id", id);
  };

  return (
    <div style={styles.container} className="text-black container">
      <h1 style={styles.title}>Todo List</h1>
      <div style={styles.inputGroup}>
        <input
          value={taskInputValue}
          onChange={(e) => setTaskInputValue(e.target.value)}
          type="text"
          placeholder="Add a task"
          style={styles.input}
        />
        <textarea
          value={taskDetailValue}
          onChange={(e) => setTaskDetailValue(e.target.value)}
          placeholder="Add task details"
          style={styles.textarea}
        />
        <input
          value={taskDeadlineValue}
          onChange={(e) => setTaskDeadlineValue(e.target.value)}
          type="date"
          placeholder="Set deadline"
          style={styles.input} // Use the same style as input
        />
        <button onClick={handleAddTask} style={styles.button}>
          <FaPlus />
        </button>
      </div>
      <div style={{ ...styles.inputGroup, marginTop: "20px" }}>
        <input
          value={columnInputValue}
          onChange={(e) => setColumnInputValue(e.target.value)}
          type="text"
          placeholder="Add a column"
          style={styles.input}
        />
        <button onClick={handleAddColumn} style={styles.button}>
          <FaPlus />
        </button>
      </div>
      <div style={styles.columnsContainer}>
        {state.columns.map((col) => (
          <div
            key={col.status}
            onDrop={(e) => onDrop(e, col.status)}
            onDragOver={(e) => e.preventDefault()}
            style={{ ...styles.column }}
          >
            <div style={styles.columnHeader}>
              <h2 style={{ ...styles.columnTitle, color: col.color }}>
                {col.status.toUpperCase()}
              </h2>
              <div style={styles.columnActions}>
                <input
                  type="color"
                  value={col.color}
                  onChange={(e) =>
                    handleColorChange(col.status, e.target.value)
                  }
                  style={{ ...styles.colorPicker }}
                />
                <FaTimes
                  onClick={() => handleDeleteColumn(col.status)}
                  style={{ ...styles.deleteIcon, color: col.color }}
                />
              </div>
            </div>
            {state.tasks
              .filter((task) => task.status === col.status)
              .map((task) => (
                <Draggable key={task.id}>
                  <div
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    style={{
                      ...styles.task,
                    }}
                  >
                    <div style={{ width: "100%", justifyContent : 'start', alignItems : 'start' }} className="text-black bg-red items-start justify-start">
                      <h4>{task.title}</h4>
                      <div style={styles.taskDetails}>
                        <p>{task.details}</p>
                      </div>
                      <div style={styles.subBox}>
                        <span
                          style={{
                            ...styles.span,
                            backgroundColor: col.color,
                          }}
                        >
                          {task.deadline} {/* Display the deadline */}
                        </span>
                        <p>Gia Bao</p>
                      </div>
                    </div>
                    <button
                      style={styles.taskButton}
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </Draggable>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",

  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginRight: "10px",
    flex: "1",
  },
  textarea: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginRight: "10px",
    flex: "2",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  columnsContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  column: {
    flex: "1",
    margin: "0 10px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#f8f9fa",
    minHeight: "300px",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  columnTitle: {
    fontSize: "18px",
  },
  columnActions: {
    display: "flex",
    alignItems: "center",
  },
  colorPicker: {
    marginRight: "10px",
  },
  deleteIcon: {
    cursor: "pointer",
  },
  task: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "move",
  },
  taskButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#dc3545",
  },
  taskDetails: {
    marginTop: "10px",
    marginBottom: "10px",
  },
  subBox: {
    display: "flex",
    justifyContent: "space-between",
  },
  span: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "5px",
    fontSize: "12px",
    color: "#fff",
  },
};

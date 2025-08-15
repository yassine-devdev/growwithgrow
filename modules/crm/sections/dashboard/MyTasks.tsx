

import React, { useState } from 'react';
import GlassCard from '../../../../components/GlassCard';
import { PlusIcon } from '../../components/Icons';
import AddTaskModal from '../../components/AddTaskModal';

interface Task {
    id: number;
    title: string;
    priority: 'Low' | 'Medium' | 'High';
    dueDate: string;
}

const initialTasks: {
    todo: Task[];
    inProgress: Task[];
    completed: Task[];
} = {
    todo: [
        { id: 1, title: 'Follow up with lead from CyberCorp', priority: 'High', dueDate: '2024-08-01' },
        { id: 2, title: 'Prepare proposal for Omni Consumer Products', priority: 'High', dueDate: '2024-08-03' },
    ],
    inProgress: [
        { id: 3, title: 'Negotiate contract with Weyland-Yutani', priority: 'Medium', dueDate: '2024-07-30' },
    ],
    completed: [
        { id: 4, title: 'Onboard new client: Tyrell Corporation', priority: 'Low', dueDate: '2024-07-20' },
    ],
};

const priorityClasses = {
    High: 'bg-red-500/30 text-red-300',
    Medium: 'bg-yellow-500/30 text-yellow-300',
    Low: 'bg-green-500/30 text-green-300',
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <GlassCard className="p-3 mb-3 cursor-grab active:cursor-grabbing">
        <p className="font-semibold text-white">{task.title}</p>
        <div className="flex justify-between items-center mt-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full font-bold ${priorityClasses[task.priority]}`}>{task.priority}</span>
            <span className="text-gray-400">{task.dueDate}</span>
        </div>
    </GlassCard>
);

const TaskColumn: React.FC<{ title: string; tasks: Task[] }> = ({ title, tasks }) => (
    <div className="flex-1">
        <GlassCard className="p-4 h-full flex flex-col bg-cyber-surface/70">
            <h3 className="text-lg font-bold text-cyber-cyan mb-4">{title}</h3>
            <div className="flex-1 overflow-y-auto pr-2">
                {tasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
        </GlassCard>
    </div>
);

const MyTasks: React.FC = () => {
    const [tasks, setTasks] = useState(initialTasks);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddTask = (task: Omit<Task, 'id'>) => {
        const newTask = { ...task, id: Date.now() };
        setTasks(prev => ({...prev, todo: [...prev.todo, newTask]}));
    };

    return (
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">My Tasks</h2>
                    <p className="text-gray-400">Manage your CRM-related tasks.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-purple text-white font-bold rounded-lg hover:shadow-glow-purple transition-shadow"
                >
                    <PlusIcon className="w-5 h-5"/>
                    Add Task
                </button>
            </div>

            <div className="flex-1 flex gap-2 overflow-x-auto">
                <TaskColumn title="To Do" tasks={tasks.todo} />
                <TaskColumn title="In Progress" tasks={tasks.inProgress} />
                <TaskColumn title="Completed" tasks={tasks.completed} />
            </div>

            {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} onAddTask={handleAddTask} />}
        </div>
    );
};

export default MyTasks;

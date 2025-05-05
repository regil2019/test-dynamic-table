import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Для перестановки 
const reorder = (list, startIndex, endIndex) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}

export default function ItemList() {
    const [items, setItems] = useState([]);
    const [offset, setOffset] = useState(0);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState([]) 
    
    
    const loadItems = async () => {
        const res = await axios.get('http://localhost:3001/items', {
            params: {offset, limit:20, query},
        })
        setItems(prev => [...prev, ...res.data.data]);
    };

    const memoizedLoadItems = useCallback(loadItems, [offset, query]);

    useEffect (() => {
        memoizedLoadItems();

    }, [memoizedLoadItems]);
    
    const handleScroll = (e) => {
        if (e.target.scrollHeigth - e.target.scrollTop === e.target.clientHeight) {
            setOffset(prev => prev + 20);
        }
    };
    const onDragEnd = (result) => {
        if(!result.destination) return;
        const newSelected = reorder(
            selected,
            result.source.index,
            result.destination.index);
        setSelected(newSelected);
    }
    return (
        <div  onScroll={handleScroll} className="h-96 overflow-auto border">
            <input
            className="w-full p2 border mb-2"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setItems([])
                setOffset(0)
            }}
            placeholder="Поиск"
            />
            <div className="mb-4 border p-2">
                <h2 className="font-bold">Выбрать</h2>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="selected">
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                {selected.map((id, index) => (
                                   <Draggable key={id} draggableId={id.toString()} index={index}>
                                    {(provided) => (
                                        <div
                                        className="p-2 border-b bg-gray-100" 
                                        ref={provided.innerRef}
                                        {...provided.drappableProps}
                                        {...provided.dragHandleProps}
                                        >
                                            {id}
                                        </div>
                                    )}

                                   </Draggable>
                                ))}

                            </div>
                        )}

                    </Droppable>
                </DragDropContext>
            </div>
             <div onScroll={handleScroll} className="h-96 overflow-auto border">
            {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 border-b">
                    <input 
                    type="checkbox" 
                    checked={selected.includes(item.id)}
                    onChange={() => {
                        setSelected(prev =>
                            prev.includes(item.id)
                              ? prev.filter(id => id !== item.id)
                              : [...prev, item.id]
                        )
                    }}
                    />
                    <span>{item.id}</span>
                </div>
            ))}
            </div>
        </div>
    );
}
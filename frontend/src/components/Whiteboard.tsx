import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { socket } from '../utils/socket';

const Whiteboard: React.FC = () => {
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const undoStack = useRef<fabric.Object[]>([]);
    const redoStack = useRef<fabric.Object[]>([]);
    const [isErasing, setIsErasing] = useState(false);

    useEffect(() => {
        const canvasElement = document.getElementById('canvas') as HTMLCanvasElement | null;
        if (!canvasElement) return;

        if (canvasRef.current) {
            canvasRef.current.dispose();
            canvasRef.current = null;
        }

        const canvas = new fabric.Canvas(canvasElement, {
            isDrawingMode: true,
            backgroundColor: 'white',
        });

        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = 2;
        canvas.freeDrawingBrush.color = '#000000';

        canvasRef.current = canvas;

        const resizeCanvas = () => {
            const container = document.getElementById('canvas-container');
            if (container && canvasRef.current) {
                canvasRef.current.setHeight(container.clientHeight);
                canvasRef.current.setWidth(container.clientWidth);
                canvasRef.current.renderAll();
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        canvas.on('path:created', (e) => {
            if (e.path) {
                undoStack.current.push(e.path);
                socket.emit('draw', e.path.toObject());
            }
        });

        socket.on('draw', (pathData) => {
           
           const path = new fabric.Path(pathData.path, pathData);
canvas.add(path);
canvas.renderAll();
        });

        socket.on('clear', () => {
            canvas.clear();
            canvas.backgroundColor = 'white';
            canvas.renderAll();
        });

        socket.on('send-canvas', (targetSocketId) => {
            const canvasData = canvas.toJSON();
            socket.emit('canvas-data', { to: targetSocketId, data: canvasData });
        });

        socket.on('canvas-data', ({ data }) => {
            canvas.loadFromJSON(data, () => {
                canvas.renderAll();
            });
        });

        socket.emit('request-canvas');

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.dispose();
            socket.off('draw');
            socket.off('clear');
            socket.off('send-canvas');
            socket.off('canvas-data');
        };
    }, [isErasing]);

    const handleUndo = () => {
        const canvas = canvasRef.current;
        if (canvas && undoStack.current.length > 0) {
            const obj = undoStack.current.pop();
            if (obj) {
                canvas.remove(obj);
                redoStack.current.push(obj);
                canvas.renderAll();
            }
        }
    };

    const handleRedo = () => {
        const canvas = canvasRef.current;
        if (canvas && redoStack.current.length > 0) {
            const obj = redoStack.current.pop();
            if (obj) {
                canvas.add(obj);
                undoStack.current.push(obj);
                canvas.renderAll();
            }
        }
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.clear();
            canvas.backgroundColor = 'white';
            canvas.renderAll();
            undoStack.current = [];
            redoStack.current = [];
            socket.emit('clear');
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'whiteboard.png';
            link.click();
        }
    };

    const toggleDrawingMode = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.isDrawingMode = !canvas.isDrawingMode;
        }
    };

    const handleAddText = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const text = new fabric.IText('Enter text', {
                left: 100,
                top: 100,
                fontSize: 20,
            });
            canvas.add(text);
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const canvas = canvasRef.current;
        if (canvas && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = e.target.value;
        }
    };

    const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const canvas = canvasRef.current;
        if (canvas && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = parseInt(e.target.value);
        }
    };

    return (
        <>
            <div
                id="canvas-container"
                className="w-100 border border-primary rounded mt-3"
                style={{ height: '80vh' }}
            >
                <canvas id="canvas" />
            </div>
            <div className="mt-2">
                <button onClick={handleUndo} className="btn btn-secondary me-2">Undo</button>
                <button onClick={handleRedo} className="btn btn-secondary me-2">Redo</button>
                <button
                    onClick={() => setIsErasing(!isErasing)}
                    className={`btn ${isErasing ? 'btn-danger' : 'btn-secondary'} me-2`}
                >
                    {isErasing ? 'Eraser On' : 'Eraser Off'}
                </button>
                <button onClick={handleClear} className="btn btn-warning me-2">Clear</button>
                <button onClick={handleDownload} className="btn btn-success me-2">Download</button>
                <button onClick={toggleDrawingMode} className="btn btn-dark me-2">Toggle Mode</button>
                <button onClick={handleAddText} className="btn btn-info me-2">Add Text</button>
            </div>
            <div className="mt-3">
                <label className="me-2">
                    Color:
                    <input type="color" onChange={handleColorChange} className="ms-2" />
                </label>
                <label className="ms-3">
                    Brush Size:
                    <input
                        type="range"
                        min="1"
                        max="30"
                        defaultValue="2"
                        onChange={handleBrushSizeChange}
                        className="ms-2"
                    />
                </label>
            </div>
        </>
    );
};

export default Whiteboard;

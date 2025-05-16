import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { socket } from '../utils/socket';

interface WhiteboardProps {
  sessionId: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ sessionId }) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const undoStack = useRef<fabric.Object[]>([]);
  const redoStack = useRef<fabric.Object[]>([]);
  const otherCursorsRef = useRef<Record<string, fabric.Circle>>({});
  const [isErasing, setIsErasing] = useState(false);

  // Init Canvas
  useEffect(() => {
    const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvasEl) return;

    const canvas = new fabric.Canvas(canvasEl, {
      isDrawingMode: true,
      backgroundColor: 'white',
    });

    const pencil = new fabric.PencilBrush(canvas);
    pencil.width = 2;
    pencil.color = '#000000';
    canvas.freeDrawingBrush = pencil;

    canvasRef.current = canvas;

    const resizeCanvas = () => {
      if (containerRef.current) {
        canvas.setWidth(containerRef.current.clientWidth);
        canvas.setHeight(containerRef.current.clientHeight);
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handlePathCreated = (e: any) => {
      if (e.path) {
        undoStack.current.push(e.path);
        socket.emit('draw', e.path.toObject());
      }
    };
    canvas.on('path:created', handlePathCreated);

    const handleMouseMove = (e: fabric.IEvent<MouseEvent>) => {
      const pointer = canvas.getPointer(e.e);
      socket.emit('cursor-move', {
        x: pointer.x,
        y: pointer.y,
        socketId: socket.id,
      });
    };
    canvas.on('mouse:move', handleMouseMove);

    // Socket Events
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
      const data = canvas.toJSON();
      socket.emit('canvas-data', { to: targetSocketId, data });
    });

    socket.on('canvas-data', ({ data }) => {
      canvas.loadFromJSON(data, () => canvas.renderAll());
    });

    socket.on('cursor-move', ({ x, y, socketId }) => {
      if (socketId === socket.id) return;
      const existing = otherCursorsRef.current[socketId];
      if (!existing) {
        const circle = new fabric.Circle({
          left: x,
          top: y,
          radius: 4,
          fill: 'red',
          stroke: 'black',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        canvas.add(circle);
        otherCursorsRef.current[socketId] = circle;
      } else {
        existing.set({ left: x, top: y });
      }
      canvas.requestRenderAll();
    });

    socket.on('user-disconnected', (socketId) => {
      const circle = otherCursorsRef.current[socketId];
      if (circle) {
        canvas.remove(circle);
        delete otherCursorsRef.current[socketId];
      }
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.off('path:created', handlePathCreated);
      canvas.off('mouse:move', handleMouseMove);
      canvas.dispose();
      canvasRef.current = null;

      socket.off('draw');
      socket.off('clear');
      socket.off('send-canvas');
      socket.off('canvas-data');
      socket.off('cursor-move');
      socket.off('user-disconnected');

      Object.values(otherCursorsRef.current).forEach((cursor) => canvas.remove(cursor));
      otherCursorsRef.current = {};
    };
  }, []);

  useEffect(() => {
    socket.emit('join-session', sessionId);
    socket.emit('request-canvas');
    return () => {
      socket.emit('leave-session', sessionId);
    };
  }, [sessionId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = isErasing ? 'white' : '#000000';
    }
  }, [isErasing]);

  // Handlers
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
    if (canvas) canvas.isDrawingMode = !canvas.isDrawingMode;
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
    <div className="">
      <div className="row">
        {/* Left Toolbar */}
        <div className="col-12 col-md-2 mb-3 mb-md-0 d-flex flex-md-column align-items-center gap-2">
          <button onClick={handleUndo} className="btn btn-outline-secondary" title="Undo">
            <i className="bi bi-arrow-counterclockwise"></i>
          </button>
          <button onClick={handleRedo} className="btn btn-outline-secondary" title="Redo">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
          <button
            onClick={() => setIsErasing(prev => !prev)}
            className={`btn ${isErasing ? 'btn-danger' : 'btn-outline-dark'}`}
            title="Eraser"
          >
            <i className="bi bi-eraser"></i>
          </button>
          <button onClick={handleClear} className="btn btn-outline-warning" title="Clear All">
            <i className="bi bi-trash"></i>
          </button>
          <button onClick={handleDownload} className="btn btn-outline-success" title="Download">
            <i className="bi bi-download"></i>
          </button>
          <button onClick={toggleDrawingMode} className="btn btn-outline-dark" title="Toggle Mode">
            <i className="bi bi-pencil"></i>
          </button>
          <button onClick={handleAddText} className="btn btn-outline-info" title="Add Text">
            <i className="bi bi-fonts"></i>
          </button>

          {/* Color & Size */}
          <div className="d-flex flex-column align-items-center mt-3">
            <input type="color" onChange={handleColorChange} title="Brush Color" />
            <input
              type="range"
              min="1"
              max="30"
              defaultValue="2"
              onChange={handleBrushSizeChange}
              className="form-range mt-2"
              title="Brush Size"
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="col-12 col-md-10">
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '80vh',
              border: '2px solid #ccc',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <canvas id="canvas" style={{ position: 'absolute', left: 0, top: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;

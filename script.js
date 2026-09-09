* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background-color: #0d020d;
    overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#flowerCanvas {
    display: block;
    background-color: #0d020d;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(13, 2, 13, 0.9);
    animation: fadeIn 0.5s;
}

.modal.show {
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: #1a051a;
    border: 2px solid #ff66b2;
    border-radius: 15px;
    padding: 30px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    box-shadow: 0 0 30px rgba(255, 102, 178, 0.5);
    animation: slideIn 0.5s;
}

.modal-content h2 {
    color: #ffb3d9;
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    text-shadow: 0 0 10px rgba(255, 179, 217, 0.5);
}

.letter-container {
    background-color: #0d020d;
    border: 1px solid #ff1493;
    border-radius: 10px;
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
    margin-bottom: 20px;
}

.letter-container::-webkit-scrollbar {
    width: 10px;
}

.letter-container::-webkit-scrollbar-track {
    background: #0d020d;
    border-radius: 5px;
}

.letter-container::-webkit-scrollbar-thumb {
    background: #ff66b2;
    border-radius: 5px;
}

.letter-container::-webkit-scrollbar-thumb:hover {
    background: #ff1493;
}

.letter-text {
    color: #ffb3d9;
    font-size: 16px;
    line-height: 1.8;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.close-btn {
    display: block;
    width: 100%;
    padding: 15px 30px;
    background-color: #ff1493;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.close-btn:hover {
    background-color: #ff66b2;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 20, 147, 0.4);
}

.close-btn:active {
    transform: translateY(0);
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Responsive */
@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        padding: 20px;
    }
    
    .modal-content h2 {
        font-size: 20px;
    }
    
    .letter-text {
        font-size: 14px;
    }
}
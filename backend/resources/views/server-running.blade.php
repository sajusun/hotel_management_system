<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Server Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, 'Segoe UI', 'Courier New', monospace;
        }

        .card {
            background: white;
            padding: 3rem 4rem;
            border-radius: 24px;
            box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.05);
            text-align: center;
            transition: all 0.2s ease;
        }

        .status-symbol {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: inline-block;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        h1 {
            font-size: 2.2rem;
            font-weight: 600;
            color: #1a2c3e;
            letter-spacing: -0.3px;
            margin-bottom: 1rem;
        }

        .alive-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: #f0f3f8;
            padding: 0.5rem 1.2rem;
            border-radius: 60px;
            font-size: 0.9rem;
            font-weight: 500;
            color: #2c6e2f;
            font-family: monospace;
        }

        .pulse-dot {
            width: 12px;
            height: 12px;
            background-color: #2ecc40;
            border-radius: 50%;
            box-shadow: 0 0 6px #2ecc40;
            animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(0.9);
                opacity: 0.6;
            }

            50% {
                transform: scale(1.2);
                opacity: 1;
                background-color: #2aff6e;
                box-shadow: 0 0 10px #2aff6e;
            }

            100% {
                transform: scale(0.9);
                opacity: 0.6;
            }
        }

        .blink-text {
            animation: softBlink 2s infinite;
            font-weight: 500;
        }

        @keyframes softBlink {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: 0.6;
            }
        }

        hr {
            margin: 1.2rem 0;
            border: none;
            height: 1px;
            background: #e2e8f0;
        }

        .sub {
            font-size: 0.75rem;
            color: #6c7a8a;
            margin-top: 1rem;
            font-family: monospace;
        }
    </style>
</head>

<body>
    <div class="card">
        <div class="status-symbol">
            ⚙️
        </div>
        <h1>Server is Running</h1>
        <div class="alive-indicator">
            <div class="pulse-dot"></div>
            <span class="blink-text">● ALIVE / ACTIVE</span>
        </div>
        <hr>
        <div class="sub">
            [ STILL ALIVE — SYSTEM OPERATIONAL ]
        </div>
    </div>
</body>

</html>
from flask import Flask, request, send_from_directory, jsonify
from tika import parser
import os
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

fileName = ''

UPLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__))
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file():
    global fileName

    if 'file' not in request.files:
        return "Nenhum arquivo enviado", 400

    file = request.files['file']

    if file.filename == '':
        return "Nome de arquivo vazio", 400

    if file:
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
        fileName = file.filename
        return "Arquivo enviado com sucesso e salvo como: " + file.filename

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/read-pdf', methods=['GET'])
def getTextFromPDF():
    global fileName

    if not fileName:
        return jsonify({'error': 'Nenhum arquivo enviado ainda'}), 400

    raw = parser.from_file(os.path.join(app.config['UPLOAD_FOLDER'], fileName))
    content = raw['content']
    removeSpaces = re.sub(r'\n+', '\n', content)
    formatted = removeSpaces.replace('\n', ' ').replace('PDF exclusivo para Igor Gabriel Martins Ramos - rm553085 igorgabprofissional@gmail.com', '').replace('FIGURA', '').replace('O mundo dos dados', '')

    response = jsonify({'result': formatted})
    response.headers.add('Access-Control-Allow-Origin', '*')  # Permitir todas as origens

    return response

# Configurar o cabeçalho 'Referrer-Policy'
@app.after_request
def set_referrer_policy(response):
    response.headers['Referrer-Policy'] = 'origin-when-cross-origin'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0')

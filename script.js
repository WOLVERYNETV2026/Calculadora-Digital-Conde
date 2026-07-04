/**
 * Calculadora Digital Conde - Versão 1.0
 * Desenvolvedor: WOLVERYNE
 * 
 * Recursos:
 * - Calculadora comum e científica
 * - Histórico com data/hora
 * - Bloco de notas com proteção por senha
 * - Temas personalizáveis
 * - Configurações
 * - Suporte a teclado
 */

(function() {
    "use strict";

    // ========== DOM REFERENCES ==========
    const dataDisplay = document.getElementById('dataDisplay');
    const horaDisplay = document.getElementById('horaDisplay');
    const diaSemana = document.getElementById('diaSemana');
    const bateriaDisplay = document.getElementById('bateriaDisplay');
    const resultadoDisplay = document.getElementById('resultadoDisplay');
    const expressaoDisplay = document.getElementById('expressaoDisplay');
    const historicoLista = document.getElementById('historicoLista');
    const notasTextarea = document.getElementById('notasTextarea');
    const contadorCaracteres = document.getElementById('contadorCaracteres');
    const limparHistoricoBtn = document.getElementById('limparHistorico');
    const modoComumBtn = document.getElementById('modoComum');
    const modoCientificoBtn = document.getElementById('modoCientifico');
    const cientificoButtons = document.getElementById('cientificoButtons');
    const tamanhoFonte = document.getElementById('tamanhoFonte');
    const tamanhoFonteValor = document.getElementById('tamanhoFonteValor');
    const somBotoesCheck = document.getElementById('somBotoes');
    const vibracaoCheck = document.getElementById('vibracao');
    const toggleConfigBtn = document.getElementById('toggleConfig');
    const configContent = document.getElementById('configContent');
    const abrirSobreBtn = document.getElementById('abrirSobre');
    const modalSobre = document.getElementById('modalSobre');
    const modalSenha = document.getElementById('modalSenha');
    const fecharSobre = document.querySelector('.modal-fechar');
    const confirmarSenhaBtn = document.getElementById('confirmarSenha');
    const cancelarSenhaBtn = document.getElementById('cancelarSenha');
    const inputSenha = document.getElementById('inputSenha');
    const erroSenha = document.getElementById('erroSenha');
    const bloquearNotaBtn = document.getElementById('bloquearNota');

    // ========== STATE ==========
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let shouldResetDisplay = false;
    let isScientificMode = false;
    let expressao = '';
    let memory = 0;
    let senhaNotas = '';
    let notasBloqueadas = false;
    let historico = [];
    let temaAtual = 'escuro';
    let audioContext = null;

    // ========== INICIALIZAÇÃO ==========
    function init() {
        carregarConfiguracoes();
        atualizarDateTime();
        setInterval(atualizarDateTime, 1000);
        carregarHistorico();
        carregarNotas();
        atualizarBateria();
        setInterval(atualizarBateria, 30000);
        resultadoDisplay.textContent = '0';
        atualizarContador();
        configurarEventos();
        document.getElementById('sobreData').textContent = new Date().toLocaleDateString('pt-BR');
    }

    // ========== DATA E HORA ==========
    function atualizarDateTime() {
        const now = new Date();
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        dataDisplay.textContent = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
        diaSemana.textContent = dias[now.getDay()];
        horaDisplay.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    }

    // ========== BATERIA ==========
    function atualizarBateria() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const nivel = Math.round(battery.level * 100);
                const icone = nivel > 75 ? '🔋' : nivel > 40 ? '🔸' : '🔴';
                bateriaDisplay.textContent = `${icone} ${nivel}%`;
            }).catch(() => {
                bateriaDisplay.textContent = '⚡ --%';
            });
        } else {
            bateriaDisplay.textContent = '⚡ --%';
        }
    }

    // ========== DISPLAY ==========
    function atualizarDisplay(valor) {
        let str = String(valor);
        if (str.length > 20) {
            const num = parseFloat(str);
            if (!isNaN(num) && isFinite(num)) {
                str = num.toExponential(10);
            }
        }
        resultadoDisplay.textContent = str;
    }

    function setCurrentNumber(valor) {
        if (valor === undefined || isNaN(valor) || !isFinite(valor)) {
            currentInput = 'Erro';
            atualizarDisplay('Erro');
            return;
        }
        let str = String(valor);
        if (str.length > 20 && !str.includes('e')) {
            const num = parseFloat(str);
            if (!isNaN(num) && isFinite(num)) {
                str = num.toExponential(10);
            }
        }
        currentInput = str;
        atualizarDisplay(currentInput);
    }

    function resetCalculator() {
        currentInput = '0';
        previousInput = '';
        operation = null;
        shouldResetDisplay = false;
        expressao = '';
        expressaoDisplay.textContent = '';
        atualizarDisplay('0');
    }

    // ========== OPERAÇÕES ==========
    function compute(a, op, b) {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        if (isNaN(numA) || isNaN(numB)) return 'Erro';
        let result;
        switch (op) {
            case 'add': result = numA + numB; break;
            case 'subtract': result = numA - numB; break;
            case 'multiply': result = numA * numB; break;
            case 'divide': 
                if (numB === 0) return 'Erro';
                result = numA / numB; 
                break;
            case 'percent': result = numA * (numB / 100); break;
            case 'power': result = Math.pow(numA, numB); break;
            default: return 'Erro';
        }
        if (!isFinite(result)) return 'Erro';
        return result;
    }

    function scientificOperation(op, value) {
        const num = parseFloat(value);
        if (isNaN(num) || !isFinite(num)) return 'Erro';
        let result;
        switch (op) {
            case 'sin': result = Math.sin(num); break;
            case 'cos': result = Math.cos(num); break;
            case 'tan': result = Math.tan(num); break;
            case 'log': 
                if (num <= 0) return 'Erro';
                result = Math.log10(num); 
                break;
            case 'ln': 
                if (num <= 0) return 'Erro';
                result = Math.log(num); 
                break;
            case 'sqrt': 
                if (num < 0) return 'Erro';
                result = Math.sqrt(num); 
                break;
            case 'square': result = num * num; break;
            case 'cube': result = num * num * num; break;
            case 'factorial': 
                if (num < 0 || !Number.isInteger(num) || num > 170) return 'Erro';
                let fact = 1;
                for (let i = 2; i <= num; i++) fact *= i;
                result = fact;
                break;
            case 'inv': 
                if (num === 0) return 'Erro';
                result = 1 / num; 
                break;
            case 'pi': result = Math.PI; break;
            case 'euler': result = Math.E; break;
            default: return 'Erro';
        }
        if (!isFinite(result)) return 'Erro';
        return result;
    }

    function getOperatorSymbol(op) {
        const symbols = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷',
            'percent': '%',
            'power': '^'
        };
        return symbols[op] || op;
    }

    // ========== MANIPULAÇÃO DOS BOTÕES ==========
    function handleNumberClick(num) {
        if (shouldResetDisplay) {
            currentInput = '0';
            shouldResetDisplay = false;
        }
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else {
            if (num === '.' && currentInput.includes('.')) return;
            currentInput += num;
        }
        atualizarDisplay(currentInput);
        tocarSom();
    }

    function handleOperatorClick(op) {
        if (op === 'clear') {
            resetCalculator();
            tocarSom();
            return;
        }
        if (op === 'backspace') {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            atualizarDisplay(currentInput);
            tocarSom();
            return;
        }
        if (op === 'percent') {
            const num = parseFloat(currentInput);
            if (!isNaN(num) && isFinite(num)) {
                const result = num / 100;
                setCurrentNumber(result);
                tocarSom();
            }
            return;
        }
        
        // Operações de memória
        if (['mc', 'mr', 'mplus', 'mminus'].includes(op)) {
            handleMemory(op);
            tocarSom();
            return;
        }
        
        // Parênteses
        if (op === 'lparen') {
            if (currentInput === '0') {
                currentInput = '(';
                atualizarDisplay(currentInput);
            }
            tocarSom();
            return;
        }
        
        // Operações básicas
        if (['add', 'subtract', 'multiply', 'divide', 'power'].includes(op)) {
            if (operation && !shouldResetDisplay) {
                const result = compute(previousInput, operation, currentInput);
                if (result === 'Erro') {
                    resetCalculator();
                    resultadoDisplay.textContent = 'Erro';
                    return;
                }
                setCurrentNumber(result);
                previousInput = currentInput;
            } else {
                previousInput = currentInput;
            }
            operation = op;
            shouldResetDisplay = true;
            expressao = `${previousInput} ${getOperatorSymbol(op)}`;
            expressaoDisplay.textContent = expressao;
            tocarSom();
            return;
        }
        
        if (op === 'equals') {
            if (!operation) {
                return;
            }
            const result = compute(previousInput, operation, currentInput);
            if (result === 'Erro') {
                resetCalculator();
                resultadoDisplay.textContent = 'Erro';
                return;
            }
            const entrada = `${previousInput} ${getOperatorSymbol(operation)} ${currentInput}`;
            setCurrentNumber(result);
            adicionarHistorico(entrada, currentInput);
            expressaoDisplay.textContent = entrada + ' =';
            previousInput = '';
            operation = null;
            shouldResetDisplay = true;
            tocarSom();
            return;
        }
        
        // Operações científicas
        if (isScientificMode) {
            const sciResult = scientificOperation(op, currentInput);
            if (sciResult === 'Erro') {
                resetCalculator();
                resultadoDisplay.textContent = 'Erro';
                return;
            }
            const entrada = `${op}(${currentInput})`;
            setCurrentNumber(sciResult);
            adicionarHistorico(entrada, currentInput);
            expressaoDisplay.textContent = entrada + ' =';
            shouldResetDisplay = true;
            tocarSom();
        }
    }

    // ========== MEMÓRIA ==========
    function handleMemory(op) {
        const num = parseFloat(currentInput);
        switch(op) {
            case 'mc':
                memory = 0;
                break;
            case 'mr':
                setCurrentNumber(memory);
                shouldResetDisplay = true;
                break;
            case 'mplus':
                if (!isNaN(num) && isFinite(num)) {
                    memory += num;
                }
                break;
            case 'mminus':
                if (!isNaN(num) && isFinite(num)) {
                    memory -= num;
                }
                break;
        }
    }

    // ========== SOM E VIBRAÇÃO ==========
    function tocarSom() {
        if (!somBotoesCheck || !somBotoesCheck.checked) return;
        
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch(e) {
            // Silencia erro de áudio
        }
        
        // Vibração
        if (vibracaoCheck && vibracaoCheck.checked && navigator.vibrate) {
            navigator.vibrate(10);
        }
 }
      // ========== HISTÓRICO ==========
    function adicionarHistorico(entrada, resultado) {
        const now = new Date();
        const dataHora = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        historico.unshift({
            entrada: entrada,
            resultado: resultado,
            dataHora: dataHora
        });
        
        if (historico.length > 50) historico.pop();
        salvarHistorico();
        renderizarHistorico();
    }

    function renderizarHistorico() {
        historicoLista.innerHTML = historico.map(item => `
            <div class="historico-item">
                <span>${item.entrada} = ${item.resultado}</span>
                <span style="font-size:0.7rem;opacity:0.6;">${item.dataHora}</span>
            </div>
        `).join('');
    }

    function salvarHistorico() {
        try {
            localStorage.setItem('historicoCalculadora', JSON.stringify(historico));
        } catch(e) {}
    }

    function carregarHistorico() {
        try {
            const dados = localStorage.getItem('historicoCalculadora');
            if (dados) {
                historico = JSON.parse(dados);
                renderizarHistorico();
            }
        } catch(e) {}
    }

    function limparHistorico() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            historico = [];
            salvarHistorico();
            renderizarHistorico();
        }
    }

    // ========== NOTAS ==========
    function salvarNotas() {
        const conteudo = notasTextarea.value;
        try {
            localStorage.setItem('notasCalculadora', conteudo);
            if (senhaNotas) {
                localStorage.setItem('notasSenha', btoa(senhaNotas));
            }
            alert('Notas salvas com sucesso!');
            atualizarContador();
        } catch(e) {
            alert('Erro ao salvar notas.');
        }
    }

    function abrirNotas() {
        try {
            const notas = localStorage.getItem('notasCalculadora');
            if (notas !== null) {
                if (notasBloqueadas) {
                    alert('Notas bloqueadas! Desbloqueie primeiro.');
                    return;
                }
                notasTextarea.value = notas;
                atualizarContador();
                alert('Notas carregadas com sucesso!');
            } else {
                alert('Nenhuma nota salva encontrada.');
            }
        } catch(e) {
            alert('Erro ao abrir notas.');
        }
    }

    function carregarNotas() {
        try {
            const notas = localStorage.getItem('notasCalculadora');
            if (notas !== null) {
                notasTextarea.value = notas;
            }
            const senha = localStorage.getItem('notasSenha');
            if (senha) {
                senhaNotas = atob(senha);
                notasBloqueadas = true;
                notasTextarea.disabled = true;
                notasTextarea.placeholder = '🔒 Bloco de notas protegido por senha';
                bloquearNotaBtn.textContent = '🔓 Desbloquear';
            }
        } catch(e) {}
        atualizarContador();
    }

    function exportarNotas() {
        const conteudo = notasTextarea.value;
        if (!conteudo) {
            alert('Não há conteúdo para exportar.');
            return;
        }
        
        const blob = new Blob([conteudo], {type: 'text/plain'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `notas_${new Date().toISOString().slice(0,10)}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function importarNotas() {
        if (notasBloqueadas) {
            alert('Notas bloqueadas! Desbloqueie primeiro.');
            return;
        }
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const conteudo = event.target.result;
                    notasTextarea.value = conteudo;
                    salvarNotas();
                    atualizarContador();
                    alert('Arquivo importado com sucesso!');
                } catch(err) {
                    alert('Erro ao importar arquivo.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function limparNotas() {
        if (notasBloqueadas) {
            alert('Notas bloqueadas! Desbloqueie primeiro.');
            return;
        }
        if (confirm('Tem certeza que deseja limpar todas as notas?')) {
            notasTextarea.value = '';
            salvarNotas();
            atualizarContador();
        }
    }

    function bloquearNotas() {
        if (!senhaNotas) {
            // Definir senha
            const senha = prompt('Defina uma senha para o bloco de notas (mínimo 4 caracteres):');
            if (senha && senha.length >= 4) {
                senhaNotas = senha;
                notasBloqueadas = true;
                notasTextarea.disabled = true;
                localStorage.setItem('notasSenha', btoa(senhaNotas));
                bloquearNotaBtn.textContent = '🔓 Desbloquear';
                notasTextarea.placeholder = '🔒 Bloco de notas protegido por senha';
                alert('Senha definida com sucesso!');
            } else if (senha !== null) {
                alert('A senha deve ter pelo menos 4 caracteres.');
            }
        } else {
            // Desbloquear ou bloquear
            if (notasBloqueadas) {
                // Desbloquear
                modalSenha.style.display = 'flex';
                inputSenha.value = '';
                erroSenha.style.display = 'none';
                inputSenha.focus();
            } else {
                // Bloquear
                notasBloqueadas = true;
                notasTextarea.disabled = true;
                bloquearNotaBtn.textContent = '🔓 Desbloquear';
                notasTextarea.placeholder = '🔒 Bloco de notas protegido por senha';
                alert('Notas bloqueadas!');
            }
        }
    }

    function verificarSenha() {
        if (inputSenha.value === senhaNotas) {
            notasBloqueadas = false;
            notasTextarea.disabled = false;
            bloquearNotaBtn.textContent = '🔒 Bloquear';
            notasTextarea.placeholder = 'Digite suas anotações aqui...';
            modalSenha.style.display = 'none';
            alert('Notas desbloqueadas!');
            inputSenha.value = '';
            erroSenha.style.display = 'none';
        } else {
            erroSenha.style.display = 'block';
            inputSenha.value = '';
            inputSenha.focus();
        }
    }

    function cancelarSenha() {
        modalSenha.style.display = 'none';
        inputSenha.value = '';
        erroSenha.style.display = 'none';
    }

    function atualizarContador() {
        const count = notasTextarea.value.length;
        contadorCaracteres.textContent = `${count} caracteres`;
    }

    // ========== CONFIGURAÇÕES ==========
    function carregarConfiguracoes() {
        try {
            const config = localStorage.getItem('configCalculadora');
            if (config) {
                const dados = JSON.parse(config);
                if (dados.tema) {
                    aplicarTema(dados.tema);
                }
                if (dados.fonte) {
                    tamanhoFonte.value = dados.fonte;
                    tamanhoFonteValor.textContent = dados.fonte + 'px';
                    document.querySelector('.display-resultado').style.fontSize = dados.fonte + 'px';
                }
                if (dados.som !== undefined) {
                    somBotoesCheck.checked = dados.som;
                }
                if (dados.vibracao !== undefined) {
                    vibracaoCheck.checked = dados.vibracao;
                }
            }
        } catch(e) {}
    }

    function salvarConfiguracoes() {
        try {
            const config = {
                tema: temaAtual,
                fonte: tamanhoFonte.value,
                som: somBotoesCheck.checked,
                vibracao: vibracaoCheck.checked
            };
            localStorage.setItem('configCalculadora', JSON.stringify(config));
        } catch(e) {}
    }

    function aplicarTema(tema) {
        temaAtual = tema;
        const app = document.getElementById('app');
        app.className = `tema-${tema}`;
        
        // Atualizar botões de tema
        document.querySelectorAll('.tema-btn').forEach(btn => {
            btn.classList.remove('ativo');
            if (btn.dataset.tema === tema) {
                btn.classList.add('ativo');
            }
        });
        
        salvarConfiguracoes();
    }

    function toggleConfig() {
        if (configContent.style.display === 'none') {
            configContent.style.display = 'block';
            toggleConfigBtn.textContent = '▲';
        } else {
            configContent.style.display = 'none';
            toggleConfigBtn.textContent = '▼';
        }
    }

    // ========== MODAL SOBRE ==========
    function abrirSobre() {
        modalSobre.style.display = 'flex';
    }

    function fecharModalSobre() {
        modalSobre.style.display = 'none';
    }

    // ========== MODO CIENTÍFICO ==========
    function setModo(scientific) {
        isScientificMode = scientific;
        if (scientific) {
            modoCientificoBtn.classList.add('active');
            modoComumBtn.classList.remove('active');
            cientificoButtons.style.display = 'grid';
        } else {
            modoComumBtn.classList.add('active');
            modoCientificoBtn.classList.remove('active');
            cientificoButtons.style.display = 'none';
        }
        resetCalculator();
        salvarConfiguracoes();
    }

    // ========== CONFIGURAR EVENTOS ==========
    function configurarEventos() {
        // ===== Teclado =====
        document.querySelector('.teclado').addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.dataset.num !== undefined) {
                handleNumberClick(target.dataset.num);
                return;
            }
            if (target.dataset.op !== undefined) {
                handleOperatorClick(target.dataset.op);
                return;
            }
            if (target.classList.contains('btn-science') && target.dataset.op) {
                handleOperatorClick(target.dataset.op);
            }
        });

        // ===== Modos =====
        modoComumBtn.addEventListener('click', () => setModo(false));
        modoCientificoBtn.addEventListener('click', () => setModo(true));

        // ===== Histórico =====
        limparHistoricoBtn.addEventListener('click', limparHistorico);

        // ===== Notas =====
        document.getElementById('salvarNota').addEventListener('click', salvarNotas);
        document.getElementById('abrirNota').addEventListener('click', abrirNotas);
        document.getElementById('exportarNota').addEventListener('click', exportarNotas);
        document.getElementById('importarNota').addEventListener('click', importarNotas);
        document.getElementById('limparNotas').addEventListener('click', limparNotas);
        bloquearNotaBtn.addEventListener('click', bloquearNotas);

        // ===== Senha =====
        confirmarSenhaBtn.addEventListener('click', verificarSenha);
        cancelarSenhaBtn.addEventListener('click', cancelarSenha);
        inputSenha.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                verificarSenha();
            }
            if (e.key === 'Escape') {
                cancelarSenha();
            }
        });

        // ===== Notas textarea =====
        notasTextarea.addEventListener('input', function() {
            atualizarContador();
            if (!notasBloqueadas) {
                // Auto-save
                try {
                    localStorage.setItem('notasCalculadora', this.value);
                } catch(e) {}
            }
        });

        // ===== Configurações =====
        toggleConfigBtn.addEventListener('click', toggleConfig);

        document.querySelectorAll('.tema-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                aplicarTema(this.dataset.tema);
            });
        });

        tamanhoFonte.addEventListener('input', function() {
            const valor = this.value + 'px';
            tamanhoFonteValor.textContent = valor;
            document.querySelector('.display-resultado').style.fontSize = valor;
            salvarConfiguracoes();
        });

        somBotoesCheck.addEventListener('change', salvarConfiguracoes);
        vibracaoCheck.addEventListener('change', salvarConfiguracoes);

        // ===== Sobre =====
        abrirSobreBtn.addEventListener('click', abrirSobre);
        fecharSobre.addEventListener('click', fecharModalSobre);
        modalSobre.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalSobre();
            }
        });

        // ===== Keyboard Support =====
        document.addEventListener('keydown', function(e) {
            const key = e.key;
            
            // Impede comportamento padrão para teclas específicas
            if (['0','1','2','3','4','5','6','7','8','9','.','+','-','*','/','%','Enter','=','Backspace','Escape'].includes(key)) {
                e.preventDefault();
            }
            
            if (key >= '0' && key <= '9') {
                handleNumberClick(key);
            } else if (key === '.') {
                handleNumberClick('.');
            } else if (key === 'Enter' || key === '=') {
                handleOperatorClick('equals');
            } else if (key === 'Backspace') {
                handleOperatorClick('backspace');
            } else if (key === 'Escape') {
                handleOperatorClick('clear');
            } else if (key === '%') {
                handleOperatorClick('percent');
            } else if (key === '+') {
                handleOperatorClick('add');
            } else if (key === '-') {
                handleOperatorClick('subtract');
            } else if (key === '*') {
                handleOperatorClick('multiply');
            } else if (key === '/') {
                handleOperatorClick('divide');
            } else if (key === '^') {
                if (isScientificMode) {
                    handleOperatorClick('power');
                }
            } else if (key === 'm' || key === 'M') {
                // Atalho para memória (M+)
                handleMemory('mplus');
            } else if (key === 'r' || key === 'R') {
                handleMemory('mr');
            }
        });
    }

    // ========== INICIAR ==========
    init();
    console.log('📱 Calculadora Digital Conde v1.0 carregada com sucesso!');
    console.log('👨‍💻 Desenvolvido por WOLVERYNE');

})();

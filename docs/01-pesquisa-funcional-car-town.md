# Documentação e Pesquisa Funcional: Car Town

## 1. Visão Geral
Car Town foi um jogo social de navegador (Facebook e web) lançado em 2010 pela Cie Games. Combinava elementos de simulação de garagem estilo Tycoon, personalização de carros reais e corridas de arrancada (Drag Race).

## 2. Loop Principal de Gameplay
1. **Atividades de Garagem (Work Bays):**
   - Elevadores de serviço para lavar carros, trocar óleo, ajustar freios, etc.
   - Cada serviço exige um investimento inicial (Job Cost), um tempo de execução (Timer) e retorna Moedas (Coins) e Experiência (XP).
   - Prazo de Coleta do Cliente: Se o jogador não recolher os ganhos no tempo igual à duração do serviço, o cliente vai embora e o investimento é perdido.

2. **Economia Dual e Progresso:**
   - **Gold Coins:** Moeda padrão para serviços, carros básicos e expansões de garagem.
   - **Blue Coins / Cash:** Moeda premium para carros superesportivos, tunagem de motor e aceleração de timers.
   - **Garage Value (GV):** Soma do valor financeiro da garagem (carros + decoração + expansões), requisito para desbloqueio de carros avançados.

3. **Master Mechanic (Restauração Clássica):**
   - Exige a conclusão de 10 Carros Básicos para desbloqueio.
   - Requer a coleta de 6 tipos de peças: Engrenagens, Pistões, Velas, Óleo, Fibra de Vidro e Correias.

4. **Corridas de Arrancada (Drag Race):**
   - Câmera 2D lateral.
   - Semáforo "Christmas Tree" com contagem e cálculo de tempo de reação em milissegundos (queima de largada se acelerar antes do verde).
   - Mecânica de troca de marchas (RPM Gauge) com zona de Perfect Shift.

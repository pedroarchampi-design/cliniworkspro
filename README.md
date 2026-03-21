# CliniWorks Pro

Este repositório contém um núcleo inicial para a solução solicitada, com foco em:

1. **Integração da câmera do celular com Jay Vision** para leitura de imagem do nódulo.
2. **Classificação sugerida segundo critérios BI-RADS** e segmento recomendado.
3. **Comparação do exame atual com exames anteriores**.

## Estrutura

- `src/cliniworkspro/vision.py`: lógica de sugestão BI-RADS a partir das features extraídas.
- `src/cliniworkspro/comparison.py`: comparação entre o exame atual e o anterior.
- `src/cliniworkspro/models.py`: modelos de dados e enums de domínio.

## Fluxo esperado

1. A câmera do celular captura o frame e o envia para o Jay Vision.
2. O Jay Vision retorna as *features* do nódulo (forma, margens, ecogenicidade, etc.).
3. As features são passadas para `analyze_nodule_image` para obter a sugestão BI-RADS e o segmento.
4. `compare_exams` compara o exame atual com o último exame disponível.

> **Observação**: a integração direta com o SDK/APIs do Jay Vision deve ser realizada
> na camada de aplicativo (mobile/web) e alimentar o payload descrito neste núcleo.

## Próximos passos sugeridos

- Conectar os campos do payload aos materiais e resumos clínicos fornecidos.
- Refinar as heurísticas de pontuação para refletir os critérios BI-RADS reais.
- Persistir exames anteriores para comparação automática.

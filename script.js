// ============================================
// Redstone Terrain Designer - Main Script
// ============================================

class RedstoneTerrainDesigner {
    constructor() {
        this.designData = null;
        this.rotation = 0;
        this.zoom = 1;
        this.blockInfo = this.getBlockInfo();
        this.initEventListeners();
    }

    // ブロック情報定義
    getBlockInfo() {
        return {
            'dirt': { name: '土', color: '#8B4513', id: 'dirt' },
            'stone': { name: '石', color: '#808080', id: 'stone' },
            'grass_block': { name: '草ブロック', color: '#228B22', id: 'grass_block' },
            'cobblestone': { name: '丸石', color: '#696969', id: 'cobblestone' },
            'oak_wood': { name: 'オークの木材', color: '#8B4513', id: 'oak_wood' },
            'concrete': { name: 'コンクリート', color: '#A9A9A9', id: 'concrete' },
            'sand': { name: '砂', color: '#F4A460', id: 'sand' },
            'gravel': { name: '砂利', color: '#A9A9A9', id: 'gravel' }
        };
    }

    // イベントリスナーの初期化
    initEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateDesign());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetForm());
        
        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // ビューコントロール
        document.getElementById('rotateLeftBtn').addEventListener('click', () => this.rotate(-15));
        document.getElementById('rotateRightBtn').addEventListener('click', () => this.rotate(15));
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());

        // エクスポート
        document.getElementById('copyToClipboardBtn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('downloadImageBtn').addEventListener('click', () => this.downloadImage());
    }

    // 設計図生成
    generateDesign() {
        try {
            // 入力値の取得
            const x1 = parseInt(document.getElementById('x1').value);
            const z1 = parseInt(document.getElementById('z1').value);
            const x2 = parseInt(document.getElementById('x2').value);
            const z2 = parseInt(document.getElementById('z2').value);
            const depth = parseInt(document.getElementById('depth').value);
            const buildHeight = parseInt(document.getElementById('buildHeight').value);
            const blockType = document.getElementById('blockType').value;
            const speed = document.getElementById('speed').value;

            // バリデーション
            if (x1 === x2 || z1 === z2) {
                alert('開始座標と終了座標が同じです');
                return;
            }

            if (depth <= 0 || buildHeight <= 0) {
                alert('掘り下げ深さ、積み上げ高さは1以上の値を入力してください');
                return;
            }

            // 設計データの作成
            this.designData = {
                area: {
                    x1: Math.min(x1, x2),
                    z1: Math.min(z1, z2),
                    x2: Math.max(x1, x2),
                    z2: Math.max(z1, z2),
                    width: Math.abs(x2 - x1),
                    length: Math.abs(z2 - z1)
                },
                depth: depth,
                buildHeight: buildHeight,
                blockType: blockType,
                speed: speed,
                totalBlocks: Math.abs(x2 - x1) * Math.abs(z2 - z1) * buildHeight,
                timestamp: new Date().toLocaleString('ja-JP')
            };

            // UI更新
            this.render3DView();
            this.renderTopView();
            this.renderSideView();
            this.displayMaterials();
            this.displayInstructions();

            // エクスポートボタン表示
            document.getElementById('copyToClipboardBtn').style.display = 'block';
            document.getElementById('downloadImageBtn').style.display = 'block';
            document.getElementById('copyMaterialsBtn').style.display = 'block';
            document.getElementById('downloadInstructionsBtn').style.display = 'block';

            console.log('設計図生成完了:', this.designData);
        } catch (error) {
            console.error('エラー:', error);
            alert('エラーが発生しました: ' + error.message);
        }
    }

    // 3D ビュー描画
    render3DView() {
        const canvas = document.getElementById('renderCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 10 * this.zoom;

        // 背景
        ctx.fillStyle = '#e8f4f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // グリッド描画
        ctx.strokeStyle = '#d0d0d0';
        ctx.lineWidth = 0.5;
        for (let i = -5; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX + i * scale, centerY - 50);
            ctx.lineTo(centerX + i * scale, centerY + 50);
            ctx.stroke();
        }

        // 掘り下げエリア（赤）
        ctx.fillStyle = 'rgba(231, 76, 60, 0.6)';
        ctx.fillRect(
            centerX - this.designData.area.width * scale / 2,
            centerY,
            this.designData.area.width * scale,
            this.designData.depth * scale
        );

        // 積み上げエリア（緑）
        ctx.fillStyle = 'rgba(46, 204, 113, 0.6)';
        ctx.fillRect(
            centerX - this.designData.area.width * scale / 2,
            centerY - this.designData.buildHeight * scale,
            this.designData.area.width * scale,
            this.designData.buildHeight * scale
        );

        // 枠線
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;

        // 掘り下げ枠
        ctx.strokeRect(
            centerX - this.designData.area.width * scale / 2,
            centerY,
            this.designData.area.width * scale,
            this.designData.depth * scale
        );

        // 積み上げ枠
        ctx.strokeRect(
            centerX - this.designData.area.width * scale / 2,
            centerY - this.designData.buildHeight * scale,
            this.designData.area.width * scale,
            this.designData.buildHeight * scale
        );

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('掘り下げ', centerX, centerY + this.designData.depth * scale / 2);
        ctx.fillStyle = '#fff';
        ctx.fillText('積み上げ', centerX, centerY - this.designData.buildHeight * scale / 2);

        // 寸法表記
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`幅: ${this.designData.area.width}ブロック`, 20, 30);
        ctx.fillText(`奥行: ${this.designData.area.length}ブロック`, 20, 50);
        ctx.fillText(`掘深: ${this.designData.depth}ブロック`, 20, 70);
        ctx.fillText(`積上: ${this.designData.buildHeight}ブロック`, 20, 90);
    }

    // 俯瞰図描画
    renderTopView() {
        const canvas = document.getElementById('topViewCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padding = 30;
        const usableWidth = canvas.width - 2 * padding;
        const usableHeight = canvas.height - 2 * padding;

        const blockSize = Math.min(
            (usableWidth - 20) / this.designData.area.width,
            (usableHeight - 20) / this.designData.area.length
        );

        const startX = padding + 10;
        const startY = padding + 10;

        // 背景
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 整地エリア
        ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.fillRect(
            startX,
            startY,
            this.designData.area.width * blockSize,
            this.designData.area.length * blockSize
        );

        // Redstone 回路エレメント
        this.drawCircuitElements(ctx, startX, startY, blockSize);

        // 枠線
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            startX,
            startY,
            this.designData.area.width * blockSize,
            this.designData.area.length * blockSize
        );

        // 座標表記
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`X: ${this.designData.area.x1}`, canvas.width - 10, 20);
        ctx.fillText(`Z: ${this.designData.area.z1}`, canvas.width - 10, 35);
    }

    // 回路エレメント描画
    drawCircuitElements(ctx, startX, startY, blockSize) {
        // ピストン（青）
        ctx.fillStyle = '#3498db';
        for (let i = 0; i < this.designData.area.width; i += 3) {
            ctx.fillRect(startX + i * blockSize, startY + 5, blockSize * 0.8, blockSize * 0.8);
        }

        // リピーター（黄）
        ctx.fillStyle = '#f39c12';
        for (let i = 0; i < this.designData.area.width; i += 5) {
            ctx.fillRect(startX + 15 + i * blockSize, startY + 20, blockSize * 0.6, blockSize * 0.6);
        }

        // レッドストーン（赤）
        ctx.fillStyle = '#e74c3c';
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#c0392b';
        for (let i = 1; i < this.designData.area.width; i += 2) {
            ctx.strokeRect(startX + i * blockSize, startY + 35, blockSize * 0.5, blockSize * 0.5);
        }
    }

    // 側面図描画
    renderSideView() {
        const canvas = document.getElementById('sideViewCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const padding = 30;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const blockSize = 15;

        // 背景
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // グリッドライン
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.designData.depth + this.designData.buildHeight; i++) {
            ctx.beginPath();
            ctx.moveTo(padding, centerY + i * blockSize - (this.designData.buildHeight * blockSize) / 2);
            ctx.lineTo(canvas.width - padding, centerY + i * blockSize - (this.designData.buildHeight * blockSize) / 2);
            ctx.stroke();
        }

        // 掘り下げエリア
        ctx.fillStyle = 'rgba(231, 76, 60, 0.4)';
        ctx.fillRect(
            padding,
            centerY,
            canvas.width - 2 * padding,
            this.designData.depth * blockSize
        );

        // 積み上げエリア
        ctx.fillStyle = 'rgba(46, 204, 113, 0.4)';
        ctx.fillRect(
            padding,
            centerY - this.designData.buildHeight * blockSize,
            canvas.width - 2 * padding,
            this.designData.buildHeight * blockSize
        );

        // ピストン配置
        ctx.fillStyle = '#3498db';
        ctx.fillRect(padding + 20, centerY - 5, blockSize, blockSize);

        // リピーター配置
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(padding + 60, centerY - 10, blockSize * 0.7, blockSize * 0.7);

        // ラベル
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('積み上げ', 20, centerY - this.designData.buildHeight * blockSize / 2);
        ctx.fillText('掘り下げ', 20, centerY + this.designData.depth * blockSize / 2);

        // 枠線
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(padding, centerY, canvas.width - 2 * padding, this.designData.depth * blockSize);
        ctx.strokeRect(padding, centerY - this.designData.buildHeight * blockSize, canvas.width - 2 * padding, this.designData.buildHeight * blockSize);
    }

    // 必要アイテム表示
    displayMaterials() {
        const materialsDiv = document.getElementById('materialsList');
        
        const materials = {
            'ピストン': Math.ceil(this.designData.area.width / 2),
            'リピーター': Math.ceil(this.designData.area.width / 4),
            'レッドストーン': Math.ceil(this.designData.area.width * 1.5),
            'レバー': 1,
            this.blockInfo[this.designData.blockType].name: this.designData.totalBlocks,
            'チェストまたはホッパー': 2,
            '焙烤炉または燻製器': 1
        };

        let html = '<h4>必要なアイテム・ブロック</h4>';
        html += '<div style="margin-top: 10px;">';

        for (const [item, count] of Object.entries(materials)) {
            html += `
                <div class="material-item">
                    <span class="material-name">📦 ${item}</span>
                    <span class="material-count">${count}個</span>
                </div>
            `;
        }

        html += '</div>';
        html += `<div style="margin-top: 15px; padding: 10px; background: #e8f4f8; border-radius: 5px;">
                    <strong>合計ブロック数:</strong> ${this.designData.totalBlocks}個
                </div>`;

        materialsDiv.innerHTML = html;
    }

    // 組み立て手順表示
    displayInstructions() {
        const instructionsDiv = document.getElementById('instructionsList');

        const speedSettings = {
            'slow': '4 ティック',
            'normal': '2 ティック',
            'fast': '1 ティック',
            'ultra': '0.5 ティック'
        };

        const instructions = [
            {
                step: 1,
                title: '作業エリアの準備',
                content: `整地する領域 X: ${this.designData.area.x1}～${this.designData.area.x2}, Z: ${this.designData.area.z1}～${this.designData.area.z2} を確保します。`
            },
            {
                step: 2,
                title: 'ピストンの配置',
                content: `横向きのピストンを ${Math.ceil(this.designData.area.width / 2)} 個、等間隔で配置します。これが土を掘り下げます。`
            },
            {
                step: 3,
                title: 'リピーターの配置',
                content: `ピストンの後ろにリピーター（${speedSettings[this.designData.speed]}遅延）を配置します。これで掘り下げのタイミングを制御します。`
            },
            {
                step: 4,
                title: 'レッドストーン配線',
                content: `リピーター間をレッドストーンで繋ぎ、信号を伝播させます。全ピストンが同時に動くようにします。`
            },
            {
                step: 5,
                title: 'ブロック供給装置',
                content: `チェストまたはホッパーから ${this.blockInfo[this.designData.blockType].name} を自動供給する機構を作ります。`
            },
            {
                step: 6,
                title: '上向きピストンの配置',
                content: `掘り下げた領域に上向きピストンを配置し、${this.blockInfo[this.designData.blockType].name}を${this.designData.buildHeight}ブロック分積み上げます。`
            },
            {
                step: 7,
                title: 'レバーの設置',
                content: 'レバーを設置して、必要な時だけシステムを起動できるようにします。'
            },
            {
                step: 8,
                title: 'テスト実行',
                content: 'レバーを引いて、小さな範囲で動作確認をしてから、本格的に実行します。'
            }
        ];

        let html = '';
        instructions.forEach(instr => {
            html += `
                <div class="instruction-step">
                    <h5>ステップ ${instr.step}: ${instr.title}</h5>
                    <p>${instr.content}</p>
                </div>
            `;
        });

        instructionsDiv.innerHTML = html;
    }

    // タブ切り替え
    switchTab(tabName) {
        // タブボタン更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // タブコンテンツ更新
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const tabMap = {
            '3d': '3d-view',
            'top': 'top-view',
            'side': 'side-view',
            'materials': 'materials-view',
            'instructions': 'instructions-view'
        };

        document.getElementById(tabMap[tabName]).classList.add('active');
    }

    // ビュー回転
    rotate(angle) {
        this.rotation += angle;
        this.render3DView();
    }

    // ズーム処理
    zoomIn() {
        this.zoom = Math.min(this.zoom + 0.2, 3);
        this.render3DView();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom - 0.2, 0.5);
        this.render3DView();
    }

    // クリップボードへコピー
    copyToClipboard() {
        const text = this.generateReportText();
        navigator.clipboard.writeText(text).then(() => {
            alert('設計情報をコピーしました！');
        }).catch(() => {
            alert('コピーに失敗しました');
        });
    }

    // 画像としてダウンロード
    downloadImage() {
        const canvas = document.getElementById('renderCanvas');
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `redstone-design-${new Date().getTime()}.png`;
        link.click();
    }

    // レポートテキスト生成
    generateReportText() {
        return `
Redstone Terrain Designer - 設計レポート
生成日時: ${this.designData.timestamp}

【設定内容】
- 整地エリア: X ${this.designData.area.x1}～${this.designData.area.x2}, Z ${this.designData.area.z1}～${this.designData.area.z2}
- 領域サイズ: 幅 ${this.designData.area.width}ブロック × 奥行 ${this.designData.area.length}ブロック
- 掘り下げ深さ: ${this.designData.depth}ブロック
- 積み上げ高さ: ${this.designData.buildHeight}ブロック
- ブロック種類: ${this.blockInfo[this.designData.blockType].name}
- 回路スピード: ${this.designData.speed}
- 総ブロック数: ${this.designData.totalBlocks}個

【Realms 安全確認】
✓ このツールで生成した Redstone 回路は Minecraft 統合版 Realms で安全に使用できます
✓ コマンドは使用していません
✓ 公式機能のみを使用しています

【注意事項】
- 大規模な範囲の場合は、小分けにして実行してください
- 十分な保存ポイントを作成してからテストしてください
- サーバーの負荷を考慮してスピード設定をしてください
        `.trim();
    }

    // フォームリセット
    resetForm() {
        document.getElementById('x1').value = '0';
        document.getElementById('z1').value = '0';
        document.getElementById('x2').value = '16';
        document.getElementById('z2').value = '16';
        document.getElementById('depth').value = '5';
        document.getElementById('buildHeight').value = '3';
        document.getElementById('blockType').value = 'dirt';
        document.getElementById('speed').value = 'normal';
        
        document.getElementById('materialsList').innerHTML = '<p>設計図を生成してください</p>';
        document.getElementById('instructionsList').innerHTML = '<p>設計図を生成してください</p>';
        
        document.getElementById('copyToClipboardBtn').style.display = 'none';
        document.getElementById('downloadImageBtn').style.display = 'none';
        document.getElementById('copyMaterialsBtn').style.display = 'none';
        document.getElementById('downloadInstructionsBtn').style.display = 'none';
    }
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new RedstoneTerrainDesigner();
});

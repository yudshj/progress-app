import express, { Request, Response } from 'express';
import path from 'path';
import { marked } from 'marked';

// 用于存储进度的对象
interface ProgressData {
    current_count: number;
    total: number;
    progress: number;
    additional_info: string;
}

let progressData: ProgressData = {
    current_count: 0,
    total: 100,
    progress: 0,
    additional_info: ''
};

const app = express();
const host = '0.0.0.0';
const port = 3000;

// 配置视图引擎为 EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 使用 JSON 解析中间件来解析 POST 请求的正文
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件目录
app.use(express.static(path.join(__dirname, '../public')));

// GET 请求：渲染进度页面
app.get('/', (req: Request, res: Response) => {
    // 将进度相关内容转换为 Markdown 格式
    const markdownContent = `
### 当前文件数量: ${progressData.current_count} / ${progressData.total}
### 进度: ${progressData.progress.toFixed(2)}%

${progressData.additional_info ? `**提示信息:** ${progressData.additional_info}` : ''}
    `;

    // 将 Markdown 转换为 HTML
    const htmlContent = marked(markdownContent);

    // 渲染页面并传递转换后的 HTML
    res.render('index', {
        progress: progressData.progress,
        current_count: progressData.current_count,
        total: progressData.total,
        markdownHtml: htmlContent // 传递渲染后的 HTML 内容
    });
});

// POST 请求：更新进度
app.post('/progress', (req: Request, res: Response) => {
    const { current_count, total, additional_info } = req.body;

    if (current_count !== undefined && total !== undefined) {
        progressData.current_count = current_count;
        progressData.total = total;
        progressData.progress = (current_count / total) * 100;
        progressData.additional_info = additional_info || '';

        console.log(`更新进度: ${current_count}/${total}, 进度: ${progressData.progress}%`);
        res.status(200).send({ message: '进度更新成功' });
    } else {
        res.status(400).send({ message: '请求数据格式不正确' });
    }
});

// 启动服务器
app.listen(port, host, () => {
    console.log(`服务器正在 http://${host}:${port} 上运行`);
});

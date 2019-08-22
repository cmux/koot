# koot-diagnose

Automate test cases for any website, webapp, HTML5 page and more. Uses by _Koot.js_ project's `koot-analyze` script. Each diagnose/test case can run programmably or through CLI.

## Diagnose/Test Cases

**lighthouse**

进行一次灯塔 (Lighthouse) 基准测试和检测

**crawler**

利用爬虫尝试访问站点内的所有链接，检测以下内容

-   损坏的链接
-   文件尺寸过大的请求 (如图片、JS 代码等)
-   没有 gzip 的请求
-   页面载入过程中的报错

**styles**

对指定页面进行检测，找出不合理的样式，并给出修改意见

**memory**

在指定站点内随机的进行操作，持续一段较长的时间，检查内存占用情况

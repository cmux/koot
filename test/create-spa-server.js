import url from 'node:url';
import Koa from 'koa';
import koaStatic from 'koa-static';

const app = new Koa();

app.use(
    koaStatic(
        url.fileURLToPath(
            new URL('./projects/standard/dist-spa/', import.meta.url)
        ),
        {
            maxage: 0,
            hidden: true,
            index: 'index.html',
            defer: false,
            gzip: true,
            extensions: false,
        }
    )
);

app.listen('8980');

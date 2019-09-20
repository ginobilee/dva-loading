# @lego/dva-loading

在dva官方外增加了通过在 `payload` 上设置 `{ loading: false}` 避免该 `effect` 影响到对应的 `model` 和 `global` 的 `loading` 状态。如此可以设置局部的loading状态。

### 使用
```
import createLoading from '@lego/dva-loading';

// ...
dva.use(createLoading());
// ...
```
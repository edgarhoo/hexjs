HexJS: a page-level module manager
==================

 * author: Edgar Hoo
 * email: edgarhoo@gmail.com
 * blog: http://blog.edgar.im/
 * source: https://github.com/edgarhoo/hexjs

## Usage
 * Manual: http://hexjs.edgarhoo.org/docs/manual.html
 * 使用手册: http://hexjs.edgarhoo.org/docs/manual.zh-cn.html
 * Unit Testing: http://hexjs.edgarhoo.org/test/unit.testing.html?hexjs.debug=true

## Change Log
 * 09.07.2012 v0.8 增加模块注册失败时非debug状态的回调
 * 08.15.2012 v0.7 增加sdk输出模块数据，改require、exports、module三者以模块方式入参
 * 07.24.2012 v0.6 增加config，调整log机制
 * 04.01.2012 v0.5 支持define module时声明其依赖并入参
 * 03.24.2012 v0.4 去除exports clone机制，以增加其类型，调整log函数，并对外开放
 * 03.20.2012 v0.3.2 修复log机制，区分module不存在与register失败
 * 03.12.2012 v0.3.1.1 HexJS(fdev4)配合fdev4调整对console存在与否的判断
 * 03.09.2012 v0.3.1 调整log机制，register失败时输出message
 * 11.17.2011 v0.3 改require只读，改require某module时其exports为只读，define不含init函数的对象直接返回
 * 11.03.2011 v0.2.1 HexJS(fdev4)之_isDebug精简逻辑，修复HexJS(fdev4)重复define同名module提示出错bug，优化log时的当前时间
 * 10.30.2011 v0.2 新增独立版本，合并函数'_execute'和'_exports'，增加register匿名module失败之信息，新增noConflict函数
 * 10.22.2011 v0.1 release
 * 07.25.2011 start

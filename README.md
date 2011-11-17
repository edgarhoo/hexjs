HexJS: a page-level module manager
==================

 * author: Edgar Hoo
 * email: edgarhoo@gmail.com
 * blog: http://blog.edgar.im/
 * source: https://github.com/edgarhoo/hexjs

##Usage
 * Manual: http://hexjs.edgarhoo.org/docs/manual.html
 * 使用手册: http://hexjs.edgarhoo.org/docs/manual.zh-cn.html
 * Unit Testing: http://hexjs.edgarhoo.org/test/unit.testing.html

##Change Log
 * 11.17.2011 v0.3 改require只读，改require某module时其exports为只读，define不含init函数的对象直接返回
 * 11.03.2011 v0.2.1 hexjs(fdev4)之_isDebug精简逻辑，修复hexjs(fdev4)重复define同名module提示出错bug，优化log时的当前时间
 * 10.30.2011 v0.2 新增独立版本，合并函数'_execute'和'_exports'，增加register匿名module失败之信息，新增noConflict函数
 * 10.22.2011 v0.1 release
 * 07.25.2011 start

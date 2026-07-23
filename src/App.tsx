import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Tone = 'purple' | 'green' | 'orange' | 'red' | 'blue' | 'gray'
type Status = '已完成' | '进行中' | '待开始'

type DailyItem = {
  title: string
  desc: string
  badge: string
  icon: string
  tone: Tone
}

type Scene = {
  key: string
  title: string
  desc: string
  summary: string
  meta: string
  icon: string
  tone: Tone
  status: Status
}

type PriceSop = {
  id: string
  title: string
  subtitle: string
  desc: string
  trigger: string
  inputs: string[]
  steps: string[]
  output: string
  guardrail: string
  repeat: string
  saved: number
  icon: string
}

type ScenePreview = {
  title: string
  desc: string
  items: string[]
  output: string
  cta: string
}

type RequirementField = {
  id: string
  label: string
  badge?: string
  mode: 'multi' | 'single' | 'select'
  options: string[]
  selected: string[]
  placeholder?: string
  columns?: 2 | 3
  required?: boolean
}

type RequirementOperation = {
  type: '查询' | '新增' | '修改' | '删除' | '执行'
  title: string
  desc: string
}

type TaskRequirement = {
  title: string
  desc: string
  fields: RequirementField[]
  operations: RequirementOperation[]
  note: string
  submitText: string
}

const risks: DailyItem[] = [
  { title: '比价跟价待确认', desc: '5 个 SKU 站内外价差异常', badge: '待确认', icon: '🏷️', tone: 'red' },
  { title: '供货报价待议价', desc: '3 条新报价等待核价', badge: '待议价', icon: '📋', tone: 'orange' },
  { title: '采购建单待确认', desc: '2 张定量采购单草稿', badge: '待确认', icon: '🛒', tone: 'red' },
]

const opportunities: DailyItem[] = [
  { title: '价格窗口', desc: '竞品降价，建议跟价至 ¥899', badge: '可跟价', icon: '📈', tone: 'green' },
  { title: '券促机会', desc: '2 款商品可创建常规优惠券', badge: '可创建', icon: '🎫', tone: 'green' },
]

const actions: DailyItem[] = [
  { title: '价格场景 SOP', desc: '巡检、竞对价维护、调价草稿', badge: '可执行', icon: '🤖', tone: 'purple' },
  { title: '低库存补货', desc: '识别低库存 SKU 并生成补货单', badge: '可代办', icon: '📦', tone: 'blue' },
  { title: '日报归档', desc: '自动沉淀今日处理结果', badge: '可归档', icon: '🗄️', tone: 'gray' },
]

const scenes: Scene[] = [
  {
    key: 'product',
    title: '商品',
    desc: '商品巡检',
    summary: '查价格、查库存，核对实时价格星级',
    meta: '41 次 · 0.3H',
    icon: '🔎',
    tone: 'green',
    status: '已完成',
  },
  {
    key: 'price',
    title: '价格',
    desc: '比价跟价',
    summary: '全网与站内比价，维护实时价格',
    meta: '86 次 · 1H',
    icon: '🏷️',
    tone: 'purple',
    status: '进行中',
  },
  {
    key: 'supplier',
    title: '供应商',
    desc: '报价议价',
    summary: '处理供货报价采购与议价',
    meta: '34 次 · 0.8H',
    icon: '👥',
    tone: 'gray',
    status: '待开始',
  },
  {
    key: 'marketing',
    title: '营销',
    desc: '券促配置',
    summary: '查询、修改并创建常规优惠券',
    meta: '29 次 · 0.5H',
    icon: '📣',
    tone: 'gray',
    status: '待开始',
  },
  {
    key: 'purchase',
    title: '采购',
    desc: '采购建单',
    summary: '定量建单并批量完成库存预定',
    meta: '57 次 · 1.5H',
    icon: '📦',
    tone: 'gray',
    status: '待开始',
  },
]

const priceSops: PriceSop[] = [
  {
    id: 'price-inspection',
    title: 'SOP 1｜价格异常巡检',
    subtitle: '先发现哪些 SKU 需要核价',
    desc: '自动汇总床垫组重点 SKU 的站内价、全网价与历史价差，识别需要采销确认的异常价格。',
    trigger: '每日开工、价格星级下降或竞品价格发生变动时触发',
    inputs: ['巡检类型', '巡检位置', '终端类型', '地区', '商品范围', '商品渠道'],
    steps: ['查询：读取任务要求中的巡检类型、位置、端侧、地区与商品范围', '新增：创建本次巡检任务草稿并写入国补/政补巡检参数', '修改：按 ERP 账号、京东 pin 和商品渠道补齐筛选条件', '删除：剔除重复 SKU、无效 SKU 和非当前渠道商品', '执行：生成价格异常与腰带展示异常清单'],
    output: '价格异常巡检清单',
    guardrail: '只生成核价清单，不直接改价',
    repeat: '每天 09:30',
    saved: 18,
    icon: '🔎',
  },
  {
    id: 'competitor-price',
    title: 'SOP 2｜竞对价维护',
    subtitle: '把可确认的竞对价带回维护页',
    desc: '按采销常用路径进入比价页和价格维护页，整理竞对价、来源和建议动作，减少来回跳转。',
    trigger: '巡检发现价差异常、采销打开比价页并反复复制竞对价时触发',
    inputs: ['全网比价页', '竞对链接', '价格维护页', '历史维护记录'],
    steps: ['查询：进入全网比价页并定位异常 SKU', '新增：创建竞对价维护草稿', '修改：回填竞对店铺、竞对价、时间和来源链接', '删除：排除来源不可信或疑似脏数据的竞对价', '执行：标记需采销确认的竞对价维护项'],
    output: '竞对价维护草稿',
    guardrail: '来源不可信或价差过大时停在人工确认',
    repeat: '每天 10:20',
    saved: 21,
    icon: '🏷️',
  },
  {
    id: 'adjustment-draft',
    title: 'SOP 3｜跟价/不跟价草稿',
    subtitle: '把判断沉淀成可提交前确认的草稿',
    desc: '结合价差、毛利红线和历史操作策略，生成调价或不跟价反馈草稿，提交前交由采销确认。',
    trigger: '竞对价维护完成，且商品触发跟价、守价或不跟价判断时触发',
    inputs: ['商品成本', '毛利红线', '历史跟价策略', '价格维护权限'],
    steps: ['查询：读取商品当前售价、成本与毛利红线', '新增：生成调价草稿或不跟价反馈草稿', '修改：套用历史跟价幅度、备注模板和保护价规则', '删除：移除超出毛利红线或权限范围的调价项', '执行：提交前展示影响、风险和需确认字段'],
    output: '调价/不跟价反馈草稿',
    guardrail: '任何保存、提交、调京东价动作都必须人工确认',
    repeat: '每天 11:00',
    saved: 15,
    icon: '📄',
  },
]

const scenePreviews: Record<string, ScenePreview> = {
  product: {
    title: '商品巡检待办',
    desc: '聚合商品详情、价格、库存与资质页的全埋点行为，生成今天需要采销确认的商品巡检清单。',
    items: ['核对实时价格星级与站内价', '检查低库存与库存异常商品', '标记资质、标题、主图待维护商品'],
    output: '商品巡检清单',
    cta: 'AI 生成商品巡检清单',
  },
  supplier: {
    title: '供应商报价待办',
    desc: '整理供货报价、历史议价记录和采购需求，把可议价项沉淀成待确认草稿。',
    items: ['汇总新报价与历史供价差异', '识别可压价或需补充来源的报价', '生成议价话术和确认字段'],
    output: '供应商报价议价清单',
    cta: 'AI 生成报价议价清单',
  },
  marketing: {
    title: '营销券促待办',
    desc: '根据促销查询、优惠券创建和商品活动配置行为，生成可复用的券促配置草稿。',
    items: ['识别可创建常规优惠券商品', '复用历史券模板和活动门槛', '生成券促配置草稿并等待确认'],
    output: '券促配置草稿',
    cta: 'AI 生成券促配置草稿',
  },
  purchase: {
    title: '采购建单待办',
    desc: '基于销量预测、库存预定和采购单草稿行为，预填需要采销确认的建单信息。',
    items: ['识别需补货 SKU 与建议采购量', '预填供应商、仓库和到货批次', '标记预算、库存和交付风险'],
    output: '采购建单草稿',
    cta: 'AI 生成采购建单草稿',
  },
}

const priceRequirement: TaskRequirement = {
  title: '请设置任务要求',
  desc: 'AI 已根据床垫组近期高频路径预填任务参数，你可以在执行前补充或调整。',
  fields: [
    {
      id: 'inspectionType',
      label: '请选择你要巡检的类型',
      badge: '多选',
      mode: 'multi',
      options: ['国补巡检', '政补巡检'],
      selected: ['国补巡检', '政补巡检'],
      columns: 2,
      required: true,
    },
    {
      id: 'inspectionPosition',
      label: '请选择你要巡检的位置',
      badge: '多选',
      mode: 'multi',
      options: ['商品主图腰带', '商详信息腰带', '国补价格'],
      selected: ['商品主图腰带', '商详信息腰带', '国补价格'],
      columns: 3,
      required: true,
    },
    {
      id: 'terminal',
      label: '请选择你要巡检的终端类型',
      badge: '多选',
      mode: 'multi',
      options: ['APP端', 'PC端'],
      selected: ['APP端', 'PC端'],
      columns: 2,
      required: true,
    },
    {
      id: 'region',
      label: '请选择你要巡检的地区',
      badge: '已预填',
      mode: 'select',
      options: ['华东-上海', '华北-北京', '华南-广东', '西南-四川'],
      selected: ['华东-上海'],
      placeholder: '请选择地区',
      required: true,
    },
    {
      id: 'skuScope',
      label: '请选择巡检商品范围',
      mode: 'single',
      options: ['此ERP账号下所有SKU', '上传SKU列表', '手动输入SKU'],
      selected: ['此ERP账号下所有SKU'],
      columns: 3,
      required: true,
    },
    {
      id: 'channel',
      label: '请选择商品渠道',
      mode: 'multi',
      options: ['自营商品', '京喜商品'],
      selected: ['自营商品'],
      columns: 2,
      required: true,
    },
  ],
  operations: [
    { type: '查询', title: '读取账号与 pin 关联关系', desc: '确认当前 ERP 账号、京东 pin、商品渠道和可巡检范围。' },
    { type: '新增', title: '创建巡检任务草稿', desc: '把巡检类型、位置、终端和地区写入任务配置。' },
    { type: '修改', title: '预填筛选条件', desc: '按商品范围、渠道和地区补齐表单字段，等待采销确认。' },
    { type: '删除', title: '剔除无效商品', desc: '排除重复 SKU、不可售 SKU、非当前渠道商品和无权限商品。' },
    { type: '执行', title: '生成巡检结果', desc: '输出国补/政补展示异常、价格异常和需人工确认清单。' },
  ],
  note: '国补价格结果千人千面，已关联你的京东 pin（可切换关联 pin），当前账号为 谢理正。',
  submitText: '开始执行',
}

function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [toast, setToast] = useState('')
  const [running, setRunning] = useState<string | null>(null)
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (nextPath: string) => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const executeSop = (sop: PriceSop) => {
    if (running || completed.includes(sop.id)) return
    setRunning(sop.id)
    notify(`AI 正在执行：${sop.title}`)
    window.setTimeout(() => {
      setCompleted((current) => current.includes(sop.id) ? current : [...current, sop.id])
      setRunning(null)
      notify(`已完成：${sop.output}`)
    }, 1200)
  }

  const executeAll = () => {
    if (running || completed.length === priceSops.length) return
    setRunning('all')
    notify('AI 正在执行价格场景 3 条 SOP')
    window.setTimeout(() => {
      setCompleted(priceSops.map((sop) => sop.id))
      setRunning(null)
      notify('已完成：价格场景 3 条 SOP')
    }, 1400)
  }

  return (
    <>
      {path.includes('/daily-execution/local') ? (
        <DailyExecution
          completed={completed}
          executeAll={executeAll}
          executeSop={executeSop}
          navigate={navigate}
          notify={notify}
          running={running}
        />
      ) : path.includes('/daily-execution') ? (
        <HighFrequencyWorkspace navigate={navigate} notify={notify} />
      ) : (
        <DailyReport navigate={navigate} />
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </>
  )
}

const centerNavItems = [
  { label: '新对话', icon: '✧' },
  { label: 'AI作战室', icon: '▣' },
  { label: 'AI技能库', icon: '✣' },
  { label: 'AI操盘手', icon: '◌' },
  { label: '自动化任务', icon: '▤' },
  { label: '我的高频工作', icon: '✦', badge: 'NEW' },
]

function HighFrequencyWorkspace({
  navigate,
  notify,
}: {
  navigate: (path: string) => void
  notify: (message: string) => void
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="center-shell">
      <header className="center-topbar">
        <div className="center-product">
          <span className="center-product-mark">采</span>
          <strong>采销工作台</strong>
        </div>
        <div className="center-search"><span>✦</span><span>AI搜索</span><i>审批中心入口</i></div>
        <nav className="center-topnav" aria-label="全局导航">
          <button className="selected" type="button">✦ 经营中心</button>
          <button type="button">超级运营</button>
          <button type="button">⌁ 消息</button>
          <button type="button">▣ 工具箱</button>
          <button type="button">客户端</button>
          <button type="button">反馈</button>
          <span className="center-user">谢理正⌄</span>
        </nav>
      </header>

      <div className="center-body">
        <aside className="center-sidebar">
          <div className="center-sidebar-title"><span>Ai</span><strong>经营中心</strong><button type="button" aria-label="收起侧栏">◧</button></div>
          <div className="center-sidebar-nav">
            {centerNavItems.map((item) => {
              const active = item.label === '我的高频工作'
              return (
                <button
                  className={active ? 'active' : ''}
                  key={item.label}
                  onClick={() => {
                    if (active) return
                    if (item.label === '自动化任务') {
                      notify('自动化任务仍保留在原有模块中')
                      return
                    }
                    notify(`${item.label}模块正在建设中`)
                  }}
                  type="button"
                >
                  <span>{item.icon}</span>{item.label}{item.badge && <em>{item.badge}</em>}
                </button>
              )
            })}
          </div>
          <div className="center-sidebar-divider" />
          <div className="center-sidebar-group-label">超级工具</div>
          <button className="center-sidebar-utility" type="button" onClick={() => notify('超级运营模块正在建设中')}><span>⌁</span>超级运营</button>
          <button className="center-sidebar-utility" type="button" onClick={() => notify('超级大表模块正在建设中')}><span>▤</span>超级大表</button>
          <div className="center-sidebar-history">
            <span>历史记录</span>
            <button type="button" onClick={() => navigate('/')}>运营日报</button>
            <button type="button" onClick={() => notify('正在打开最近一次高频工作')}>最近一次高频工作</button>
            <button type="button" onClick={() => notify('正在打开最近一次高频工作')}>价格场景SOP</button>
          </div>
        </aside>

        <main className="center-main">
          <div className="center-main-head">
            <div>
              <h1>我的高频工作</h1>
              <p>基于你的操作行为，识别反复出现的采销工作，推荐直接处理或创建技能。</p>
            </div>
          </div>
          <section className="embedded-workspace" aria-label="我的高频工作页面">
            {!loaded && <div className="embed-loading"><span>✦</span><strong>正在载入高频工作数据</strong><p>正在连接独立工作页面…</p></div>}
            <iframe
              title="我的高频工作"
              src="http://11.66.132.65/daily-execution/index.html"
              onLoad={() => setLoaded(true)}
            />
          </section>
        </main>
      </div>
    </div>
  )
}

function DailyReport({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="report-layout">
      <aside className="sidebar">
        <div className="brand"><span>Ai</span><strong>AI 经营中心</strong></div>
        {['首页', '商品管理', '价格管理', '采购管理', '库存管理', '营销管理', '供应商管理', '数据分析', '自动化中心'].map((item, index) => (
          <button className={index === 0 ? 'active' : ''} key={item} type="button">{item}</button>
        ))}
        <div className="sidebar-foot">
          <button type="button">系统设置</button>
          <button type="button">帮助中心</button>
        </div>
      </aside>

      <main className="report-main">
        <header className="report-hero">
          <h1>AI 经营中心</h1>
          <section className="ask-card">
            <div className="ask-input">
              <span>✦</span>
              <strong>今天想先处理什么？</strong>
              <button type="button">→</button>
            </div>
            <div className="ask-shortcuts">
              {['商品', '价格', '采购', '库存', '营销', '供应商'].map((item) => <button key={item} type="button">{item}</button>)}
            </div>
          </section>
        </header>

        <section className="daily-card">
          <header className="daily-card-head">
            <h2>运营日报</h2>
            <span>📅 2026.6.30</span>
            <span>床垫组</span>
            <b className="risk">3项风险</b>
            <b className="opportunity">2项机会</b>
            <b className="action">3项待处理动作</b>
          </header>

          <div className="daily-columns">
            <DailyColumn title="经营风险" icon="!" tone="red" items={risks} />
            <DailyColumn title="经营机会" icon="↗" tone="green" items={opportunities} />
          </div>

          <footer className="daily-card-foot">
            <div><span>Ai</span>AI 已识别 3 条自动化链路 · 预计每周节省 2.1 小时</div>
            <button type="button" onClick={() => navigate('/daily-execution')}>展开今日工作台⌄</button>
          </footer>
        </section>

        <section className="day-card">
          <div className="day-title">
            <h2>◷ 采销的一天</h2>
            <button type="button" onClick={() => navigate('/daily-execution')}>查看我的待办 ›</button>
          </div>
          <div className="day-timeline">
            {['09:00 晨会与策略', '10:30 比价跟价', '13:30 采购议价', '15:30 建单确认', '17:30 复盘与优化'].map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="ai-suggestions">
            <h3>✦ AI 自动化建议</h3>
            {['比价异常自动监控', '供货报价智能核价', '采购建单智能推荐'].map((item) => <article key={item}>{item}</article>)}
            <button type="button" onClick={() => navigate('/daily-execution')}>全部 3 条 ›</button>
          </div>
        </section>
      </main>
    </div>
  )
}

function DailyColumn({ title, icon, tone, items }: { title: string; icon: string; tone: Tone; items: DailyItem[] }) {
  return (
    <section className={`daily-column tone-${tone}`}>
      <h3><span>{icon}</span>{title}</h3>
      {items.map((item) => (
        <article className="daily-row" key={item.title}>
          <span className={`row-icon tone-${item.tone}`}>{item.icon}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
          <em>{item.badge}</em>
          <i>›</i>
        </article>
      ))}
    </section>
  )
}

function DailyExecution({
  completed,
  executeAll,
  executeSop,
  navigate,
  notify,
  running,
}: {
  completed: string[]
  executeAll: () => void
  executeSop: (sop: PriceSop) => void
  navigate: (path: string) => void
  notify: (message: string) => void
  running: string | null
}) {
  const [selectedSceneKey, setSelectedSceneKey] = useState('price')
  const totalSaved = useMemo(() => priceSops.reduce((sum, item) => sum + item.saved, 0), [])
  const selectedScene = scenes.find((scene) => scene.key === selectedSceneKey) ?? scenes[1]
  const selectedPreview = scenePreviews[selectedSceneKey]
  const isPriceScene = selectedSceneKey === 'price'

  const selectScene = (scene: Scene) => {
    setSelectedSceneKey(scene.key)
    notify(`已切换到「${scene.title}」场景`)
  }

  const runScenePreview = () => {
    if (!selectedPreview) return
    notify(`已生成：${selectedPreview.output}`)
  }

  return (
    <div className="execution-page">
      <main className="execution-shell">
        <header className="execution-header">
          <div>
            <span className="eyebrow">✦ 从日报进入执行</span>
            <h1>床垫组今日工作台</h1>
            <p>基于全埋点聚合商品、价格、供应商、营销与采购场景，并把高频动作转为可确认、可追溯的自动化。</p>
          </div>
          <button className="back-btn" type="button" onClick={() => navigate('/')}>× 返回日报</button>
        </header>

        <section className="metric-strip">
          <Metric icon="📅" label="今日待办" value="11" suffix="项任务" tone="purple" />
          <Metric icon="🤖" label="AI 可代办" value="7" suffix="项任务" tone="green" />
          <Metric icon="🕘" label="预计节省" value="2.1" suffix="小时" tone="orange" />
        </section>

        <section className="execution-grid">
          <div className="main-column">
            <section className="panel triage-panel">
              <PanelHead title="日报执行分类" desc="把日报里的风险、机会和待处理动作放在同一张执行看板里" />
              <div className="triage-grid">
                <MiniBoard title="经营风险" count="3" tone="red" items={risks} />
                <MiniBoard title="经营机会" count="2" tone="green" items={opportunities} />
                <MiniBoard title="待处理动作" count="3" tone="purple" items={actions} />
              </div>
            </section>

            <section className="panel sop-panel">
              <div className="panel-head split">
                <div>
                  <h2>{selectedScene.title}场景{isPriceScene ? ' SOP' : '待办'}</h2>
                  <p>{isPriceScene ? '把采销每天高频的核价、维护竞对价、生成调价草稿拆成 3 条可执行 SOP' : selectedScene.summary}</p>
                </div>
                <button
                  className="primary"
                  type="button"
                  onClick={isPriceScene ? executeAll : runScenePreview}
                  disabled={isPriceScene ? running !== null || completed.length === priceSops.length : false}
                >
                  {isPriceScene
                    ? completed.length === priceSops.length ? '全部已完成' : running === 'all' ? '执行中...' : '一键执行全部 SOP'
                    : selectedPreview?.cta ?? 'AI 生成场景清单'} ✦
                </button>
              </div>

              <div className="scene-tabs">
                {scenes.map((scene) => (
                  <button
                    aria-pressed={scene.key === selectedSceneKey}
                    className={`scene-card ${scene.key === selectedSceneKey ? 'active' : ''}`}
                    key={scene.key}
                    onClick={() => selectScene(scene)}
                    type="button"
                  >
                    <span className={`scene-icon tone-${scene.tone}`}>{scene.icon}</span>
                    <strong>{scene.title}</strong>
                    <p>{scene.desc}</p>
                    <small>{scene.summary}</small>
                    <span className="scene-meta">{scene.meta}</span>
                    <em>{scene.status}</em>
                  </button>
                ))}
              </div>

              {isPriceScene ? (
                <>
                  <TaskRequirementCard
                    onRun={executeAll}
                    requirement={priceRequirement}
                    running={running !== null}
                  />
                  <div className="sop-stack">
                    <div className="sop-stack-head">
                      <h3>AI 执行 SOP</h3>
                      <p>下方是按任务要求拆出的具体执行步骤，所有保存/提交动作停在人工确认前。</p>
                    </div>
                    {priceSops.map((sop, index) => (
                      <SopCard
                        completed={completed.includes(sop.id)}
                        index={index + 1}
                        key={sop.id}
                        running={running === sop.id || running === 'all'}
                        sop={sop}
                        onExecute={() => executeSop(sop)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <ScenePreviewCard
                  preview={selectedPreview}
                  scene={selectedScene}
                  onRun={runScenePreview}
                />
              )}
            </section>
          </div>

          <aside className="side-panel">
            <h2>✦ AI 自动化建议</h2>
            <p>根据近 30 天行为识别</p>
            <div className="saving-card">
              <span>价格链路本次可省</span>
              <strong>{totalSaved} 分钟</strong>
              <em>{completed.length}/3 SOP执行</em>
            </div>
            <div className="side-sops">
              {priceSops.map((sop, index) => (
                <article className={completed.includes(sop.id) ? 'done' : ''} key={sop.id}>
                  <span>{sop.icon}</span>
                  <div>
                    <strong>{index + 1}｜{sop.title.split('｜')[1]}</strong>
                    <p>{sop.output}</p>
                    <small>{sop.repeat} · 节省 {sop.saved} 分钟</small>
                  </div>
                  <button type="button" onClick={() => executeSop(sop)} disabled={running !== null || completed.includes(sop.id)}>
                    {completed.includes(sop.id) ? '已完成' : 'AI 执行'} →
                  </button>
                </article>
              ))}
            </div>
            <footer>🛡️ 价格 SOP 默认停在“草稿/清单/待确认”状态；涉及保存、提交、调价的动作仍需采销确认。</footer>
          </aside>
        </section>
      </main>
    </div>
  )
}

function TaskRequirementCard({
  onRun,
  requirement,
  running,
}: {
  onRun: () => void
  requirement: TaskRequirement
  running: boolean
}) {
  const initialValues = useMemo(() => {
    return requirement.fields.reduce<Record<string, string[]>>((values, field) => {
      values[field.id] = field.selected
      return values
    }, {})
  }, [requirement.fields])
  const [values, setValues] = useState(initialValues)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const toggleValue = (field: RequirementField, option: string) => {
    setValues((current) => {
      if (field.mode === 'single' || field.mode === 'select') {
        return { ...current, [field.id]: [option] }
      }
      const selected = current[field.id] ?? []
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option]
      return { ...current, [field.id]: next }
    })
  }

  const updateSelect = (field: RequirementField, option: string) => {
    setValues((current) => ({ ...current, [field.id]: option ? [option] : [] }))
  }

  const canRun = requirement.fields.every((field) => {
    if (!field.required) return true
    return (values[field.id] ?? []).length > 0
  })

  return (
    <section className="task-requirement-card">
      <header>
        <div>
          <h3>▣ {requirement.title}</h3>
          <p>{requirement.desc}</p>
        </div>
        <span>{canRun ? '信息已预填' : '待补充'}</span>
      </header>

      <div className="task-requirement-layout">
        <div className="requirement-form">
          {requirement.fields.map((field) => (
            <section className="requirement-field" key={field.id}>
              <label>
                {field.label}
                {field.badge && <em>{field.badge}</em>}
              </label>

              {field.mode === 'select' ? (
                <select
                  aria-label={field.label}
                  value={values[field.id]?.[0] ?? ''}
                  onChange={(event) => updateSelect(field, event.target.value)}
                >
                  <option value="">{field.placeholder ?? '请选择'}</option>
                  {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <div className={`requirement-options cols-${field.columns ?? 2}`}>
                  {field.options.map((option) => {
                    const selected = values[field.id]?.includes(option)
                    return (
                      <button
                        className={selected ? 'selected' : ''}
                        key={option}
                        onClick={() => toggleValue(field, option)}
                        type="button"
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          ))}

          <p className="requirement-note">ⓘ {requirement.note}</p>
          <button className="requirement-submit" disabled={!canRun || running} onClick={onRun} type="button">
            ✦ {running ? '执行中...' : requirement.submitText}
          </button>
        </div>

        <aside className="operation-steps">
          <h4>AI 将执行的具体操作步骤</h4>
          {requirement.operations.map((operation, index) => (
            <article key={`${operation.type}-${operation.title}`}>
              <span>{index + 1}</span>
              <div>
                <strong><em>{operation.type}</em>{operation.title}</strong>
                <p>{operation.desc}</p>
              </div>
            </article>
          ))}
        </aside>
      </div>
    </section>
  )
}

function ScenePreviewCard({ onRun, preview, scene }: { onRun: () => void; preview: ScenePreview; scene: Scene }) {
  return (
    <article className="scene-preview-card">
      <header>
        <span className={`scene-icon tone-${scene.tone}`}>{scene.icon}</span>
        <div>
          <h3>{preview.title}</h3>
          <p>{preview.desc}</p>
        </div>
        <em>{scene.status}</em>
      </header>

      <div className="scene-preview-steps">
        {preview.items.map((item, index) => (
          <section key={item}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </section>
        ))}
      </div>

      <footer>
        <strong>产出：{preview.output}</strong>
        <span>默认生成草稿/清单，提交前仍需采销确认</span>
        <button className="sop-action" type="button" onClick={onRun}>{preview.cta}</button>
      </footer>
    </article>
  )
}

function PanelHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
      <div className="legend"><span><i className="green" />已完成</span><span><i className="purple" />进行中</span><span><i />待开始</span></div>
    </div>
  )
}

function Metric({ icon, label, value, suffix, tone }: { icon: string; label: string; value: string; suffix: string; tone: Tone }) {
  return (
    <article className="metric">
      <span className={`metric-icon tone-${tone}`}>{icon}</span>
      <div><small>{label}</small><strong>{value}</strong><em>{suffix}</em></div>
    </article>
  )
}

function MiniBoard({ title, count, tone, items }: { title: string; count: string; tone: Tone; items: DailyItem[] }) {
  return (
    <article className={`mini-board tone-${tone}`}>
      <header><h3>{title}</h3><span>{count} 项</span></header>
      {items.slice(0, 2).map((item) => <p key={item.title}><span>{item.icon}</span>{item.title}<em>{item.badge}</em></p>)}
    </article>
  )
}

function SopCard({
  completed,
  index,
  onExecute,
  running,
  sop,
}: {
  completed: boolean
  index: number
  onExecute: () => void
  running: boolean
  sop: PriceSop
}) {
  return (
    <article className={`sop-card ${completed ? 'completed' : ''}`}>
      <header>
        <div className="sop-title">
          <span className="sop-index">{index}</span>
          <span className="sop-icon">{sop.icon}</span>
          <div>
            <h3>{sop.title}</h3>
            <p>{sop.subtitle}</p>
          </div>
        </div>
        <em>{completed ? '已完成' : '可一键执行'}</em>
      </header>

      <p className="sop-desc">{sop.desc}</p>

      <div className="sop-detail">
        <section><h4>触发条件</h4><p>{sop.trigger}</p></section>
        <section><h4>输入数据</h4><ul>{sop.inputs.map((input) => <li key={input}>{input}</li>)}</ul></section>
        <section><h4>AI 执行步骤</h4><ol>{sop.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
      </div>

      <footer>
        <span>🛡️ {sop.guardrail}</span>
        <span>🕘 {sop.repeat} · 可省 {sop.saved} 分钟</span>
        <strong>产出：{sop.output}</strong>
        <button className="sop-action" type="button" onClick={onExecute} disabled={completed || running}>
          {completed ? '已完成' : running ? '执行中...' : 'AI 执行'}
        </button>
      </footer>
    </article>
  )
}

export default App

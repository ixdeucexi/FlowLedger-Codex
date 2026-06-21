import { SplashScreen } from "./SplashScreen";

const upcomingBills = [
  { name: "Pest Control", due: "Due today", amount: "$36" },
  { name: "Utilities", due: "Due today", amount: "$370" },
  { name: "Sinking Transfer", due: "Due tomorrow", amount: "$50" },
  { name: "La’Kia", due: "Due tomorrow", amount: "$791" },
];

const goals = [
  { name: "Christmas", target: "$2,000", saved: "$720", progress: 36 },
  { name: "Emergency fund", target: "$8,000", saved: "$3,440", progress: 43 },
];

const nav = [
  { label: "Dashboard", icon: "▥", href: "#dashboard" },
  { label: "Bills", icon: "▤", href: "#bills" },
  { label: "Debt", icon: "▭", href: "#debt" },
  { label: "Monthly", icon: "□", href: "#monthly" },
  { label: "More", icon: "•••", href: "#more" },
];

export default function Home() {
  return (
    <main id="dashboard">
      <SplashScreen />
      <header className="appHeader">
        <a className="wordmark" href="#dashboard"><span>F</span>FlowLedger</a>
        <div className="headerMeta"><span className="liveDot" />Your June plan is live</div>
        <button className="profile" aria-label="Open profile">JD</button>
      </header>

      <div className="shell">
        <section className="intro">
          <div><p className="kicker">Personal cash flow</p><h1>FlowLedger</h1><p>June 2026</p></div>
          <button className="addButton" aria-label="Add an item">＋</button>
        </section>

        <section className="balanceCard" aria-label="Current balance summary">
          <div className="balanceOrb one" /><div className="balanceOrb two" />
          <p>BALANCE TODAY</p>
          <strong>$3,761</strong>
          <div className="balanceDetails">
            <div><span>END OF MONTH</span><b>$4,917</b></div>
            <div><span>LOWEST BALANCE</span><b>$2,211 · Jun 10</b></div>
          </div>
          <div className="balanceProgress"><i /></div>
          <small>30% of bills paid this month</small>
        </section>

        <section className="statGrid">
          <article><strong className="blue">$5,051</strong><span>Bills</span></article>
          <article><strong className="green">$1,530</strong><span>Paid</span></article>
          <article><strong className="yellow">$3,521</strong><span>Unpaid</span></article>
          <article className="debtStat" id="debt"><div><span>Debt</span><strong className="red">$265,644</strong></div><b>›</b></article>
        </section>

        <section className="quickActions">
          <a href="#bills"><span className="actionIcon blueBox">ϟ</span><div><b>What can I do?</b><small>Find your next best money move</small></div><strong>›</strong></a>
          <a href="#monthly"><span className="actionIcon greenBox">↗</span><div><b>Can I afford this?</b><small>Check your balance on any date</small></div><strong>›</strong></a>
        </section>

        <div className="dashboardColumns">
          <section id="bills">
            <div className="sectionHeading"><div><p className="kicker">Next seven days</p><h2>Upcoming Bills</h2></div><a href="#monthly">View all</a></div>
            <div className="listCard">
              {upcomingBills.map((bill) => (
                <article className="billRow" key={bill.name}>
                  <span className="calendarIcon">□</span>
                  <div><b>{bill.name}</b><small>{bill.due}</small></div>
                  <strong>{bill.amount}</strong><i>›</i>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="sectionHeading"><div><p className="kicker">Looking ahead</p><h2>Financial Outlook</h2></div></div>
            <article className="outlookCard"><span className="calendarIcon yellowIcon">□</span><div><small>LARGEST UPCOMING BILL</small><b>La’Kia — $791 due Jun 4</b></div></article>

            <div className="sectionHeading goalsHeading"><div><p className="kicker">Build what’s next</p><h2>Financial Goals</h2></div><button>＋ Add Goal</button></div>
            <div className="goalList">
              {goals.map((goal) => (
                <article className="goalCard" key={goal.name}>
                  <div className="goalTop"><div><b>{goal.name}</b><small>Target: {goal.target}</small></div><strong>{goal.saved}</strong></div>
                  <div className="goalBar"><i style={{ width: `${goal.progress}%` }} /></div>
                  <div className="afford"><span>✓</span><div><b>You can afford this</b><small>Projected balance supports this goal</small></div></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <nav className="bottomNav" aria-label="Main navigation">
        {nav.map((item, index) => <a className={index === 0 ? "active" : ""} href={item.href} key={item.label}><span>{item.icon}</span><b>{item.label}</b></a>)}
      </nav>
    </main>
  );
}


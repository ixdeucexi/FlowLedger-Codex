const bills = [
  { name: "Studio rent", category: "Housing", amount: "$1,240", due: "Due Jul 1", tone: "mint" },
  { name: "Internet", category: "Utilities", amount: "$68", due: "Due Jul 6", tone: "gold" },
  { name: "Car insurance", category: "Insurance", amount: "$184", due: "Due Jul 9", tone: "lavender" },
];

const bars = [58, 67, 54, 72, 64, 81, 76, 69, 62, 73, 68, 78];

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

export default function Home() {
  return (
    <main>
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="FlowLedger home">
          <span className="brandMark">↗</span>
          <span>FlowLedger</span>
        </a>

        <nav aria-label="Main navigation">
          <a className="navItem active" href="#overview"><Icon>⌂</Icon>Overview</a>
          <a className="navItem" href="#bills"><Icon>▤</Icon>Bills</a>
          <a className="navItem" href="#planning"><Icon>◫</Icon>Planning</a>
          <a className="navItem" href="#goals"><Icon>◎</Icon>Goals</a>
        </nav>

        <div className="sideNote">
          <span className="lock">✓</span>
          <div><strong>Private by design</strong><p>Your financial picture stays yours.</p></div>
        </div>
      </aside>

      <section className="workspace" id="top">
        <header className="topbar">
          <div className="mobileBrand"><span className="brandMark">↗</span>FlowLedger</div>
          <div className="status"><span className="statusDot" />July plan is on track</div>
          <button className="avatar" aria-label="Open profile">JD</button>
        </header>

        <div className="content" id="overview">
          <div className="hero">
            <div>
              <p className="eyebrow">Monday, July 6</p>
              <h1>Good morning, Jordan.</h1>
              <p className="subhead">Here&apos;s what your money is doing this month.</p>
            </div>
            <button className="primaryButton"><span>＋</span>Add transaction</button>
          </div>

          <section className="metrics" aria-label="Monthly summary">
            <article className="metricCard featured">
              <div className="metricTop"><span>Available to spend</span><span className="trend">↗ 8.4%</span></div>
              <strong>$2,846</strong>
              <p>after bills and goals</p>
              <div className="spark"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="metricCard"><div className="metricIcon income">↓</div><span>Income</span><strong>$5,420</strong><p>2 deposits this month</p></article>
            <article className="metricCard"><div className="metricIcon billsIcon">▤</div><span>Bills</span><strong>$1,874</strong><p>7 of 10 paid</p><div className="progress"><i style={{ width: "70%" }} /></div></article>
            <article className="metricCard"><div className="metricIcon goalsIcon">◎</div><span>Goals</span><strong>$700</strong><p>13% of monthly income</p></article>
          </section>

          <section className="dashboardGrid">
            <article className="panel cashPanel" id="planning">
              <div className="panelHeading"><div><p className="eyebrow">Cash flow</p><h2>Your month, at a glance</h2></div><button className="textButton">View details →</button></div>
              <div className="chartSummary"><div><span>Money in</span><strong>$5,420</strong></div><div><span>Money out</span><strong>$2,574</strong></div><div><span>Remaining</span><strong className="positive">$2,846</strong></div></div>
              <div className="barChart" aria-label="Twelve month cash flow chart">{bars.map((height, index) => <div className="barColumn" key={index}><i style={{ height: `${height}%` }} /><span>{"JFMAMJJASOND"[index]}</span></div>)}</div>
            </article>

            <article className="panel billsPanel" id="bills">
              <div className="panelHeading"><div><p className="eyebrow">Coming up</p><h2>Next bills</h2></div><button className="roundButton" aria-label="View all bills">→</button></div>
              <div className="billList">{bills.map((bill) => <div className="bill" key={bill.name}><span className={`billMark ${bill.tone}`}>{bill.name[0]}</span><div><strong>{bill.name}</strong><p>{bill.category} · {bill.due}</p></div><b>{bill.amount}</b></div>)}</div>
              <div className="billFooter"><span><i />3 bills remaining</span><strong>$1,492</strong></div>
            </article>
          </section>

          <section className="goalsPanel" id="goals">
            <div><p className="eyebrow">Build what&apos;s next</p><h2>Goals worth looking forward to</h2><p className="goalCopy">Small, steady moves add up. You&apos;re already 41% of the way there.</p></div>
            <div className="goalCards">
              <article><div className="goalIcon">⌂</div><span>Emergency fund</span><strong>$4,100 <small>/ $8,000</small></strong><div className="progress"><i style={{ width: "51%" }} /></div></article>
              <article><div className="goalIcon sun">✦</div><span>Coastal getaway</span><strong>$1,240 <small>/ $3,500</small></strong><div className="progress goldProgress"><i style={{ width: "35%" }} /></div></article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}


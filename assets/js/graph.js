queue()
    .defer(d3.csv, "assets/data/Salaries.csv")
    .await(makeGraphs);

function makeGraphs(error, salaryData) {
    var ndx = crossfilter(salaryData);

    
    salaryData.forEach(function(d){
        d.salary = parseInt(d.salary);
    })
    
    show_discipline_selector(ndx);
    show_gender_balance(ndx);
    show_average_salaries(ndx);

    dc.renderAll();
}

function show_discipline_selector(ndx) {
    dim = ndx.dimension(dc.pluck("discipline"));
    group = dim.group()

    dc.selectMenu("#chart1")
        .dimension(dim)
        .group(group);

}

function show_gender_balance(ndx) {
    var dim = ndx.dimension(dc.pluck("sex"));
    var group = dim.group();

    dc.barChart("#chart1")
        .width(400)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Gender")
        .yAxis().ticks(20);
}

function show_average_salaries(ndx) {
    var dim = ndx.dimension(dc.pluck('sex'));
    
    function add_item(p, v) {
        p.count++;
        p.total += v.salary;
        p.average = p.total / p.count;
        return p;
    }

    function remove_item(p, v) {
        p.count--;
        if(p.count == 0) {
            p.total = 0;
            p.average = 0;
        } else {
            p.total -= v.salary;
            p.average = p.total / p.count;
        }
        return p;
    }
    
    function initialise() {
        return {count: 0, total: 0, average: 0};
    }

    var averageSalaryByGender = dim.group().reduce(add_item, remove_item, initialise);

    dc.barChart("#chart2")
        .width("400")
        .height("300")
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dim)
        .group(averageSalaryByGender)
        .valueAccessor(function(d){
            return d.value.average.toFixed(2);
        })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Gender")
        .yAxis().ticks(4);   
}
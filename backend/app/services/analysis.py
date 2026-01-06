def gerar_dashboard(db, EmployeeDB):
    employees = db.query(EmployeeDB).all()
    total = len(employees)
    
    if total == 0:
        return {
            "total_colaboradores": 0,
            "media_salarial": 0,
            "media_idade": 0,
            "por_departamento": [],
            "lista_departamentos": []
        }

    soma_salarios = sum(emp.salario for emp in employees)
    soma_idades = sum(emp.idade for emp in employees)
    
    # Agrupamento para os gráficos
    depts_map = {}
    for emp in employees:
        if emp.dept not in depts_map:
            depts_map[emp.dept] = {"sals": [], "count": 0}
        depts_map[emp.dept]["sals"].append(emp.salario)
        depts_map[emp.dept]["count"] += 1

    por_departamento = [
        {
            "dept": nome,
            "salario_medio": sum(v["sals"]) / v["count"],
            "quantidade": v["count"]
        } for nome, v in depts_map.items()
    ]

    return {
        "total_colaboradores": total,
        "media_salarial": soma_salarios / total,
        "media_idade": int(soma_idades / total),
        "por_departamento": por_departamento,
        "lista_departamentos": list(depts_map.keys())
    }
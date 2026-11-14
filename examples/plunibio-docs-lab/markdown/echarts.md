# Gráficos ECharts

El mismo objeto JSON se puede abrir como archivo `.echarts.json` o como bloque `echarts`.

```echarts
{
  "title": {
    "text": "Ventas por trimestre"
  },
  "tooltip": {
    "trigger": "axis"
  },
  "legend": {
    "bottom": 0
  },
  "xAxis": {
    "type": "category",
    "data": [
      "T1",
      "T2",
      "T3",
      "T4"
    ]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [
    {
      "name": "Ventas",
      "type": "bar",
      "data": [
        120,
        200,
        150,
        240
      ]
    }
  ]
}
```

## Gráfico circular

```echarts
{
  "title": {
    "text": "Distribución"
  },
  "tooltip": {},
  "series": [
    {
      "type": "pie",
      "data": [
        {
          "name": "Producto A",
          "value": 60
        },
        {
          "name": "Producto B",
          "value": 40
        }
      ]
    }
  ]
}
```

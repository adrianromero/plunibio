---
layout: docs-chapter
lang: es
translation_key: docs-<clave-compartida>
section: docs
docs_key: <clave-compartida>
title: <Título de la tarea o área>
permalink: /es/docs/<ruta-estable>/
description: <Objetivo breve y concreto.>
---

<Explica qué puede conseguir el usuario y los prerrequisitos. Copia este archivo fuera de
maintenance/ y crea su pareja EN. Registra ambas en _data/docs.yml. No publiques marcadores.>

## <Acción principal>

1. Selecciona **<etiqueta exacta de UI>**.
2. <Realiza la siguiente acción>.
3. <Comprueba el resultado esperado>.
{: .docs-steps}

{% include docs-figure.html id="<id-real-del-manifiesto-del-idioma>" %}

{% capture warning_text %}
<Consecuencia concreta antes de una acción destructiva y alternativa si procede.>
{% endcapture %}
{% include docs-callout.html type="warning" content=warning_text %}

## <Alternativas, límites o recuperación>

<Incluye únicamente atajos y comportamientos verificados, con diferencias de plataforma.>

[<Tarea relacionada>]({{ '/es/docs/<ruta-existente>/' | relative_url }})

<!-- Fuentes internas y referencia revisada: preferiblemente en el plan de mantenimiento.
No añadir un pie de versión al capítulo; se muestra en la portada Docs. -->

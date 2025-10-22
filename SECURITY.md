# Política de seguridad

Este sitio es un portafolio estático, por lo que el código no introduce dependencias de terceros ni secretos.
Aun así, GitHub puede mostrar un aviso en la pestaña **Seguridad** indicando "problemas de seguridad" hasta
que se configure al menos un conjunto de reglas de protección de ramas. No se trata de una vulnerabilidad en
el código, sino de una recomendación para endurecer el flujo de trabajo.

## Cómo crear un conjunto de reglas de rama

1. Ve a **Settings → Code and automation → Rules → New rule set**.
2. Establece un nombre descriptivo (p. ej. `main-protection`).
3. En **Target branches**, selecciona la rama `main`.
4. Habilita las reglas que prefieras. Una configuración sugerida para repositorios personales es:
   - **Require a pull request before merging** con al menos una aprobación.
   - **Require status checks to pass** si usas flujos automatizados (opcional para sitios estáticos).
   - **Require linear history** para evitar merges complejos.
   - **Block force pushes** y **Restrict deletions** para proteger la historia.
5. Guarda los cambios para activar la protección.

Si necesitas colaborar con otras personas, agrégalas a la "lista de bypass" para que puedan mantener el repositorio.

## Buenas prácticas adicionales

- Activa **Dependabot alerts** y **Secret scanning** en la pestaña de Seguridad para detectar credenciales filtradas.
- Usa ramas de características (`feature/...`) y abre Pull Requests para todo cambio significativo.
- Revisa periódicamente el informe de seguridad; si todo está en orden, verás el estado "Protegido".

Para dudas adicionales consulta la [documentación oficial de GitHub sobre rule sets](https://docs.github.com/es/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets-for-repositories-in-your-organization).

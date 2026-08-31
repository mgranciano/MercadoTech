# MercadoTech DTO Enforcer (Automated Check)

## Descripción

Este skill verifica físicamente que el código respete el principio de Responsabilidad Única y separación de capas. Garantiza que la capa de presentación no esté acoplada a la infraestructura de datos.

## Comando de Validación

Para ejecutar esta validación, debes correr el siguiente comando en la terminal desde la raíz del proyecto:

```bash
grep -rn "Tables<" components/ hooks/
```

## Reglas de Evaluación

**Si el comando no devuelve resultados:** La validación es EXITOSA ✅. El código está limpio de dependencias directas a la BD.

**Si el comando devuelve líneas de código:** La validación FALLA ❌.

Debes detenerte inmediatamente.

- Mostrar al usuario los archivos y líneas exactas que están infringiendo la regla.
- Proponer automáticamente la refactorización para extraer esa dependencia a un Service e implementar un DTO limpio.

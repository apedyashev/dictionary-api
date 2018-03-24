/**
 * @swagger
 *
 * definitions:
 *   WordPayload:
 *     type: object
 *     required:
 *       - dictionary
 *       - word
 *     properties:
 *       dictionary:
 *         type: string
 *       wordSet:
 *         type: string
 *       word:
 *         type: string
 *       translations:
 *         type: array
 *         items:
 *           $ref: "#/definitions/TranslationsPayload"
 *       isLearned:
 *         type: boolean
 *
 *   TranslationsPayload:
 *     type: object
 *     properties:
 *       text:
 *         type: string
 *       pos:
 *         type: string
 *       meanings:
 *         type: array
 *         items:
 *          - type: string
 *       synonyms:
 *         type: array
 *         items:
 *          - type: string
 *       examples:
 *         type: array
 *         items:
 *          - type: string
 *
 *   WordResponse:
 *     properties:
 *       item:
 *         type: object
 *         $ref: "#/definitions/SerializedWord"
 *
 *   WordsResponse:
 *     properties:
 *       items:
 *         type: array
 *         items:
 *           $ref: "#/definitions/SerializedWord"
 *       pagination:
 *         type: object
 *         $ref: "#/definitions/PaginationObject"
 */
